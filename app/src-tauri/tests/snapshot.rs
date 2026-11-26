//! Integration tests for `read_snapshot`, with real Git in temporary practice folders.

use std::process::Command;

use gitremastered_lib::git_runner::practice_folder::{PracticeFolder, PracticeRoot};
use gitremastered_lib::models::repo_snapshot::{ChangeKind, HeadState, Operation};
use gitremastered_lib::repo_inspector::snapshot::read_snapshot;

/// Steps that every case starts with: an empty repo on main, with a test identity.
const NEW_REPO_STEPS: [&str; 3] = [
    "git init -q -b main",
    "git config user.name 'Test Student'",
    "git config user.email student@example.com",
];

/// Builds a practice folder from the new-repo steps plus extra steps.
///
/// Input: the extra steps. Output: the temporary folder (kept alive) and the practice folder.
fn practice_repo(extra_steps: &[&str]) -> (tempfile::TempDir, PracticeFolder) {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let steps: Vec<String> = NEW_REPO_STEPS
        .iter()
        .chain(extra_steps)
        .map(|step| step.to_string())
        .collect();
    let folder = practice_root
        .create("snapshot-test", &steps)
        .expect("setup");
    (temporary_folder, folder)
}

/// Lists every file under `.git`, with its size and change time, to prove nothing was written.
///
/// Input: the practice folder. Output: one line per file.
fn git_folder_fingerprint(folder: &PracticeFolder) -> Vec<String> {
    let output = Command::new("git")
        .args(["ls-files", "--stage"])
        .current_dir(folder.path())
        .output()
        .expect("git runs");
    let index_metadata = std::fs::metadata(folder.path().join(".git/index")).ok();
    let mut fingerprint = vec![String::from_utf8_lossy(&output.stdout).to_string()];
    if let Some(metadata) = index_metadata {
        fingerprint.push(format!("{:?}", metadata.modified().ok()));
    }
    fingerprint
}

/// An empty repo: on main, no commits, nothing changed.
#[test]
fn empty_repository() {
    let (_temporary, folder) = practice_repo(&[]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert!(snapshot.commits.is_empty());
    assert!(snapshot.branches.is_empty());
    assert_eq!(
        snapshot.head,
        HeadState::Branch {
            branch_name: "main".to_string(),
            commit_id: None
        }
    );
}

/// One new file: untracked.
#[test]
fn one_untracked_file() {
    let (_temporary, folder) = practice_repo(&["echo draft > notes.txt"]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(snapshot.untracked_files, vec!["notes.txt".to_string()]);
    assert!(snapshot.staged_files.is_empty());
}

/// One staged file: in the staging area as "added".
#[test]
fn one_staged_file() {
    let (_temporary, folder) = practice_repo(&["echo draft > notes.txt", "git add notes.txt"]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(snapshot.staged_files.len(), 1);
    assert_eq!(snapshot.staged_files[0].path, "notes.txt");
    assert_eq!(snapshot.staged_files[0].change_kind, ChangeKind::Added);
    assert!(snapshot.untracked_files.is_empty());
}

/// Two commits: newest first, linked by parent, with main and HEAD on the newest.
#[test]
fn two_commits() {
    let (_temporary, folder) = practice_repo(&[
        "echo one > notes.txt",
        "git add notes.txt",
        "git commit -q -m 'First commit'",
        "echo two >> notes.txt",
        "git commit -q -am 'Second commit'",
        "echo three >> notes.txt",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    let messages: Vec<&str> = snapshot
        .commits
        .iter()
        .map(|c| c.message.as_str())
        .collect();
    assert_eq!(messages, vec!["Second commit", "First commit"]);
    assert_eq!(
        snapshot.commits[0].parent_ids,
        vec![snapshot.commits[1].id.clone()]
    );
    assert_eq!(snapshot.branches[0].name, "main");
    assert_eq!(snapshot.branches[0].commit_id, snapshot.commits[0].id);
    assert_eq!(
        snapshot.head,
        HeadState::Branch {
            branch_name: "main".to_string(),
            commit_id: Some(snapshot.commits[0].id.clone())
        }
    );
    assert_eq!(snapshot.modified_files[0].path, "notes.txt");
}

/// Reading a snapshot changes nothing in the repository.
#[test]
fn reading_never_writes_to_the_repo() {
    let (_temporary, folder) = practice_repo(&["echo draft > notes.txt", "git add notes.txt"]);
    let before = git_folder_fingerprint(&folder);

    read_snapshot(&folder).expect("snapshot");
    read_snapshot(&folder).expect("snapshot");

    assert_eq!(git_folder_fingerprint(&folder), before);
}

/// A folder that is not a Git repository gives a readable error.
#[test]
fn a_folder_without_git_is_an_error() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root.create("no-git", &[]).expect("empty folder");

    let result = read_snapshot(&folder);

    assert!(result.is_err());
}

/// The files of the latest commit are listed, including ones in subfolders; empty before
/// the first commit. A deleted file stays listed until the deletion is committed.
#[test]
fn committed_files_list_the_latest_commit() {
    let (_temporary, empty_folder) = practice_repo(&[]);
    assert!(
        read_snapshot(&empty_folder)
            .expect("snapshot")
            .committed_files
            .is_empty()
    );

    let (_temporary, folder) = practice_repo(&[
        "mkdir docs",
        "echo guide > docs/guide.md",
        "echo readme > README.md",
        "git add .",
        "git commit -q -m 'Add files'",
        "rm README.md",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(
        snapshot.committed_files,
        vec!["README.md".to_string(), "docs/guide.md".to_string()]
    );
}

/// One commit on main, used as the start of the cases below.
const ONE_COMMIT_STEPS: [&str; 3] = [
    "echo one > notes.txt",
    "git add notes.txt",
    "git commit -q -m 'First commit'",
];

/// Builds a practice repo with one commit plus extra steps.
///
/// Input: the extra steps. Output: the temporary folder (kept alive) and the practice folder.
fn repo_with_one_commit(extra_steps: &[&str]) -> (tempfile::TempDir, PracticeFolder) {
    let steps: Vec<&str> = ONE_COMMIT_STEPS
        .iter()
        .chain(extra_steps)
        .copied()
        .collect();
    practice_repo(&steps)
}

/// After an amend, the replaced commit is still in the snapshot, marked as not reachable.
#[test]
fn an_amended_commit_stays_as_a_lost_commit() {
    let (_temporary, folder) = repo_with_one_commit(&[
        "echo two >> notes.txt",
        "git commit -q -am 'Secnod commit'",
        "git commit -q --amend -m 'Second commit'",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    let lost: Vec<&str> = snapshot
        .commits
        .iter()
        .filter(|commit| !commit.is_reachable)
        .map(|commit| commit.message.as_str())
        .collect();
    assert_eq!(lost, vec!["Secnod commit"]);
    assert_eq!(snapshot.commits.len(), 3);
}

/// A stash shows up as a stash entry, and its internal commits stay out of the history.
#[test]
fn a_stash_is_listed_but_not_part_of_the_history() {
    let (_temporary, folder) = repo_with_one_commit(&[
        "echo two >> notes.txt",
        "echo new > extra.txt",
        "git stash push -q -u -m 'Half-done work'",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(
        snapshot.stashes,
        vec!["On main: Half-done work".to_string()]
    );
    assert_eq!(snapshot.commits.len(), 1);
    assert!(snapshot.modified_files.is_empty());
}

/// A merge that stops on a conflict: the file is conflicted and a merge is in progress.
#[test]
fn a_conflict_is_reported_with_the_merge_in_progress() {
    let (_temporary, folder) = repo_with_one_commit(&[
        "git switch -q -c feature",
        "echo feature > notes.txt",
        "git commit -q -am 'Feature change'",
        "git switch -q main",
        "echo main > notes.txt",
        "git commit -q -am 'Main change'",
        "git merge feature || true",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(snapshot.conflicted_files, vec!["notes.txt".to_string()]);
    assert_eq!(snapshot.operation, Some(Operation::Merge));
}

/// A local "origin" next to the repo: the remote, the upstream, ahead/behind and its tags.
#[test]
fn a_local_remote_gives_upstream_distance_and_remote_tags() {
    let (_temporary, folder) = repo_with_one_commit(&[
        "git init -q --bare ../snapshot-origin.git",
        "git remote add origin ../snapshot-origin.git",
        "git tag v1.0",
        "git push -q -u origin main --tags",
        "echo two >> notes.txt",
        "git commit -q -am 'Second commit'",
        "git tag -a v2.0 -m 'Version 2'",
    ]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    assert_eq!(snapshot.remotes.len(), 1);
    assert_eq!(snapshot.remotes[0].name, "origin");
    assert_eq!(snapshot.remotes[0].tag_names, vec!["v1.0".to_string()]);
    let main = snapshot
        .branches
        .iter()
        .find(|branch| branch.name == "main")
        .expect("main exists");
    assert_eq!(main.upstream.as_deref(), Some("origin/main"));
    assert_eq!((main.ahead, main.behind), (1, 0));
    let annotated: Vec<&str> = snapshot
        .tags
        .iter()
        .filter(|tag| tag.is_annotated)
        .map(|tag| tag.name.as_str())
        .collect();
    assert_eq!(annotated, vec!["v2.0"]);
}

/// The repo's own settings and the answer file are part of the snapshot.
#[test]
fn local_settings_and_the_answer_file_are_read() {
    let (_temporary, folder) =
        repo_with_one_commit(&["git config core.editor nano", "echo 3 > answer.txt"]);

    let snapshot = read_snapshot(&folder).expect("snapshot");

    let editor = snapshot
        .local_config
        .iter()
        .find(|entry| entry.key == "core.editor")
        .expect("core.editor is set");
    assert_eq!(editor.value, "nano");
    assert_eq!(snapshot.answer.as_deref(), Some("3"));
}
