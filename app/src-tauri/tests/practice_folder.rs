//! Integration tests for practice folders, with real Git and bash in temporary folders.

use std::fs;
use std::process::Command;

use gitremastered_lib::git_runner::practice_folder::{PracticeError, PracticeRoot};

/// Setup steps like a real mission's: a repo with one commit and one new file.
fn sample_setup_steps() -> Vec<String> {
    [
        "git init -q -b main",
        "git config user.name 'Test Student'",
        "git config user.email student@example.com",
        "echo '# Project' > README.md",
        "git add README.md",
        "git commit -q -m 'Add README'",
        "echo 'draft' > notes.txt",
    ]
    .iter()
    .map(|step| step.to_string())
    .collect()
}

/// Runs `git <arguments>` in a folder and returns its output text.
fn git_output(folder: &std::path::Path, arguments: &[&str]) -> String {
    let output = Command::new("git")
        .args(arguments)
        .current_dir(folder)
        .output()
        .expect("git runs");
    String::from_utf8_lossy(&output.stdout).trim().to_string()
}

/// The setup steps build the expected repository.
#[test]
fn create_runs_the_setup_steps_with_real_git() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");

    let folder = practice_root
        .create("three-areas", &sample_setup_steps())
        .expect("setup works");

    assert!(folder.path().ends_with("three-areas/project"));
    assert_eq!(
        git_output(folder.path(), &["log", "--format=%s"]),
        "Add README"
    );
    assert_eq!(
        git_output(folder.path(), &["status", "--porcelain"]),
        "?? notes.txt"
    );
}

/// Reset throws away the student's changes and gives a fresh copy.
#[test]
fn reset_gives_a_fresh_copy() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root
        .create("three-areas", &sample_setup_steps())
        .expect("setup works");
    fs::write(folder.path().join("extra.txt"), "student work").expect("student edits");

    let reset_folder = practice_root.reset("three-areas").expect("reset works");

    assert_eq!(reset_folder, folder);
    assert!(!folder.path().join("extra.txt").exists());
    assert_eq!(
        git_output(folder.path(), &["status", "--porcelain"]),
        "?? notes.txt"
    );
}

/// Resetting a mission that was never created is a clear error.
#[test]
fn reset_without_create_is_refused() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");

    let result = practice_root.reset("never-made");

    assert_eq!(
        result,
        Err(PracticeError::NoSavedSetup("never-made".to_string()))
    );
}

/// A failing step stops the setup and names the step.
#[test]
fn a_failing_step_is_reported() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");

    let result = practice_root.create("broken", &["git no-such-command".to_string()]);

    match result {
        Err(PracticeError::StepFailed { step, .. }) => assert_eq!(step, "git no-such-command"),
        other => panic!("expected StepFailed, got {other:?}"),
    }
}

/// Paths outside the practice root are refused, including tricks with "..".
#[test]
fn paths_outside_the_practice_root_are_refused() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let outside_folder = temporary_folder.path().join("my-own-project");
    fs::create_dir_all(&outside_folder).expect("outside folder");
    let sneaky_path = temporary_folder
        .path()
        .join("practice")
        .join("..")
        .join("my-own-project");

    for path in [
        &outside_folder,
        &sneaky_path,
        &temporary_folder.path().join("practice"),
    ] {
        let result = practice_root.check_inside(path);
        assert!(
            matches!(result, Err(PracticeError::OutsidePracticeRoot(_))),
            "{} should be refused",
            path.display()
        );
    }
}

/// A folder inside the practice root is accepted.
#[test]
fn a_practice_folder_is_accepted() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root.create("empty", &[]).expect("empty mission");

    let checked = practice_root.check_inside(folder.path()).expect("inside");

    assert_eq!(checked.path(), folder.path());
}

/// Mission IDs that could escape the root are refused before anything is created.
#[test]
fn bad_mission_ids_are_refused() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");

    let result = practice_root.create("../escape", &[]);

    assert_eq!(
        result,
        Err(PracticeError::InvalidMissionId("../escape".to_string()))
    );
    assert!(!temporary_folder.path().join("escape").exists());
}

/// Opening a mission again keeps the student's work, so "Continue lesson" picks up where they were.
#[test]
fn open_or_create_keeps_the_students_work() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root
        .open_or_create("three-areas", &sample_setup_steps())
        .expect("first open builds the folder");
    git_output(folder.path(), &["add", "notes.txt"]);

    let reopened = practice_root
        .open_or_create("three-areas", &sample_setup_steps())
        .expect("second open reuses the folder");

    assert_eq!(
        git_output(reopened.path(), &["status", "--porcelain"]),
        "A  notes.txt"
    );
}

/// When the mission's setup steps changed (a content update), the folder is built again.
#[test]
fn open_or_create_rebuilds_when_the_setup_changed() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root
        .open_or_create("three-areas", &sample_setup_steps())
        .expect("first open");
    git_output(folder.path(), &["add", "notes.txt"]);
    let mut changed_steps = sample_setup_steps();
    changed_steps.push("echo 'more' > extra.txt".to_string());

    let rebuilt = practice_root
        .open_or_create("three-areas", &changed_steps)
        .expect("rebuild");

    assert_eq!(
        git_output(rebuilt.path(), &["status", "--porcelain"]),
        "?? extra.txt\n?? notes.txt"
    );
}

/// `find` gives the folder only once it has been built.
#[test]
fn find_gives_a_folder_only_after_it_was_built() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    assert!(
        practice_root
            .find("three-areas")
            .expect("valid id")
            .is_none()
    );

    practice_root
        .create("three-areas", &sample_setup_steps())
        .expect("setup works");

    let found = practice_root.find("three-areas").expect("valid id");
    assert!(found.is_some_and(|folder| folder.path().ends_with("three-areas/project")));
}

/// A remote lesson builds a "server" and a teammate's clone beside the practice folder.
/// They work offline, and a reset removes and rebuilds them with everything else.
#[test]
fn a_local_remote_lives_beside_the_practice_folder() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let mut steps = sample_setup_steps();
    steps.extend(
        [
            "git add notes.txt",
            "git commit -q -m 'Add notes'",
            "git init -q --bare -b main ../origin.git",
            "git remote add origin ../origin.git",
            "git push -q -u origin main",
            "git clone -q ../origin.git ../teammate",
        ]
        .iter()
        .map(|step| step.to_string()),
    );

    let folder = practice_root
        .create("remotes", &steps)
        .expect("setup works");

    let workspace = folder.path().parent().expect("the workspace folder");
    assert!(workspace.join("origin.git").is_dir());
    assert!(workspace.join("teammate").join("notes.txt").is_file());
    assert_eq!(
        git_output(folder.path(), &["remote", "get-url", "origin"]),
        "../origin.git"
    );

    fs::write(workspace.join("teammate").join("scratch.txt"), "left over").expect("write");
    practice_root.reset("remotes").expect("reset works");
    assert!(!workspace.join("teammate").join("scratch.txt").exists());
    assert!(workspace.join("origin.git").is_dir());
}

/// A lesson about `git init` starts in a folder with no repository; it still counts as built.
#[test]
fn a_folder_without_a_repository_is_found_once_built() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let steps = vec!["echo '# Recipes' > README.md".to_string()];

    practice_root
        .create("start-a-repo", &steps)
        .expect("setup works");

    assert!(
        practice_root
            .find("start-a-repo")
            .expect("valid id")
            .is_some()
    );
}

/// A setup that fails halfway leaves no "built" folder behind.
#[test]
fn a_half_built_folder_is_not_found() {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let steps = vec!["git init -q -b main".to_string(), "exit 7".to_string()];

    let result = practice_root.create("broken", &steps);

    assert!(result.is_err());
    assert!(practice_root.find("broken").expect("valid id").is_none());
}
