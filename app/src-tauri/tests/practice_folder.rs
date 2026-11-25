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

    assert!(folder.path().ends_with("three-areas"));
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
