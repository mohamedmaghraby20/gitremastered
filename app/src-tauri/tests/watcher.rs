//! Integration tests for the practice-folder watcher, with real Git.

use std::fs;
use std::process::Command;
use std::sync::mpsc::{self, Receiver};
use std::time::Duration;

use gitremastered_lib::git_runner::practice_folder::{PracticeFolder, PracticeRoot};
use gitremastered_lib::models::repo_snapshot::RepoSnapshot;
use gitremastered_lib::repo_inspector::watcher::RepoWatcher;

/// How long to wait for an update before giving up.
const UPDATE_TIMEOUT: Duration = Duration::from_secs(10);
/// How long to keep listening for extra, unwanted updates.
const EXTRA_UPDATE_WINDOW: Duration = Duration::from_millis(800);

/// Builds a repo with one commit and one new file, and starts watching it.
///
/// Inputs: none. Output: the temporary folder (kept alive), the folder, the watcher, the updates.
fn watched_repo() -> (
    tempfile::TempDir,
    PracticeFolder,
    RepoWatcher,
    Receiver<RepoSnapshot>,
) {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let steps: Vec<String> = [
        "git init -q -b main",
        "git config user.name 'Test Student'",
        "git config user.email student@example.com",
        "echo one > README.md",
        "git add README.md",
        "git commit -q -m 'Add README'",
        "echo draft > notes.txt",
    ]
    .iter()
    .map(|step| step.to_string())
    .collect();
    let folder = practice_root.create("watch-test", &steps).expect("setup");
    let (sender, updates) = mpsc::channel();
    let watcher = RepoWatcher::start(folder.clone(), move |snapshot| {
        let _ = sender.send(snapshot);
    })
    .expect("watcher starts");
    (temporary_folder, folder, watcher, updates)
}

/// Runs a Git command in the folder, as a student would.
fn run_git(folder: &PracticeFolder, arguments: &[&str]) {
    let status = Command::new("git")
        .args(arguments)
        .current_dir(folder.path())
        .status()
        .expect("git runs");
    assert!(status.success(), "git {arguments:?} failed");
}

/// Waits for one update, then counts any extra updates that arrive shortly after.
///
/// Input: the update channel. Output: the update and the number of extra ones.
fn next_update_and_extras(updates: &Receiver<RepoSnapshot>) -> (RepoSnapshot, usize) {
    let update = updates
        .recv_timeout(UPDATE_TIMEOUT)
        .expect("an update arrives");
    let mut extra_count = 0;
    let mut latest = update;
    while let Ok(extra) = updates.recv_timeout(EXTRA_UPDATE_WINDOW) {
        extra_count += 1;
        latest = extra;
    }
    (latest, extra_count)
}

/// `git add` gives one update with the file staged; `git commit` gives one with the commit.
#[test]
fn add_and_commit_each_give_one_update() {
    let (_temporary, folder, _watcher, updates) = watched_repo();

    run_git(&folder, &["add", "notes.txt"]);
    let (after_add, extra_after_add) = next_update_and_extras(&updates);
    assert_eq!(after_add.staged_files[0].path, "notes.txt");
    assert_eq!(extra_after_add, 0, "git add sent more than one update");

    run_git(&folder, &["commit", "-q", "-m", "Add notes"]);
    let (after_commit, extra_after_commit) = next_update_and_extras(&updates);
    assert_eq!(after_commit.commits.len(), 2);
    assert!(after_commit.staged_files.is_empty());
    assert_eq!(
        extra_after_commit, 0,
        "git commit sent more than one update"
    );
}

/// Editing a file (nothing changes in .git) is noticed too.
#[test]
fn editing_a_file_is_noticed() {
    let (_temporary, folder, _watcher, updates) = watched_repo();

    fs::write(folder.path().join("README.md"), "changed").expect("edit");

    let (update, _) = next_update_and_extras(&updates);
    assert_eq!(update.modified_files[0].path, "README.md");
}

/// Twenty quick file writes give one update, not twenty.
#[test]
fn a_burst_of_changes_gives_one_update() {
    let (_temporary, folder, _watcher, updates) = watched_repo();

    for file_number in 0..20 {
        let file_path = folder.path().join(format!("file-{file_number}.txt"));
        fs::write(file_path, "x").expect("write");
    }

    let (update, extra_count) = next_update_and_extras(&updates);
    assert_eq!(update.untracked_files.len(), 21);
    assert_eq!(extra_count, 0, "a burst sent more than one update");
}
