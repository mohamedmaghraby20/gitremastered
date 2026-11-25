//! Builds a `RepoSnapshot` by running three read-only Git commands in a practice folder:
//! `git status`, `git log` and `git for-each-ref`, each read by its own small parser.
//!
//! Never writes to the repo. `git status` normally refreshes the index file as a side effect;
//! `GIT_OPTIONAL_LOCKS=0` turns that off (Git docs: "git status --no-optional-locks").

use crate::git_runner::hidden_command::hidden_command;
use crate::git_runner::practice_folder::PracticeFolder;
use crate::models::repo_snapshot::RepoSnapshot;

use super::parse_log::{LOG_FORMAT, parse_log};
use super::parse_refs::{REFS_FORMAT, parse_refs};
use super::parse_status::parse_status;

/// Reads the practice repository's current state.
///
/// Input: the practice folder. Output: the snapshot, or a readable error (for example when
/// the folder is not a Git repository yet).
pub fn read_snapshot(folder: &PracticeFolder) -> Result<RepoSnapshot, String> {
    let status_output = run_read_only_git(
        folder,
        &[
            "status",
            "--porcelain=v2",
            "--branch",
            "-z",
            "--untracked-files=all",
        ],
    )?;
    let status = parse_status(&status_output);

    // `--all` lists every commit reachable from any ref; an empty repo simply prints nothing.
    let log_output = run_read_only_git(folder, &["log", "--all", "--date-order", LOG_FORMAT])?;
    let refs_output = run_read_only_git(
        folder,
        &[
            "for-each-ref",
            REFS_FORMAT,
            "refs/heads",
            "refs/remotes",
            "refs/tags",
        ],
    )?;
    let refs = parse_refs(&refs_output);

    Ok(RepoSnapshot {
        commits: parse_log(&log_output),
        branches: refs.branches,
        tags: refs.tags,
        head: status.head,
        staged_files: status.staged_files,
        modified_files: status.modified_files,
        untracked_files: status.untracked_files,
    })
}

/// Runs one Git command that only reads, inside the practice folder.
///
/// Inputs: the folder and Git's arguments. Output: the command's output, or its error text.
fn run_read_only_git(folder: &PracticeFolder, arguments: &[&str]) -> Result<String, String> {
    let output = hidden_command("git")
        .args(arguments)
        .current_dir(folder.path())
        .env("GIT_OPTIONAL_LOCKS", "0")
        .env("GIT_TERMINAL_PROMPT", "0")
        .output()
        .map_err(|error| format!("Could not run Git ({error})"))?;
    if !output.status.success() {
        let error_text = String::from_utf8_lossy(&output.stderr).trim().to_string();
        return Err(format!("git {} failed: {error_text}", arguments[0]));
    }
    Ok(String::from_utf8_lossy(&output.stdout).into_owned())
}
