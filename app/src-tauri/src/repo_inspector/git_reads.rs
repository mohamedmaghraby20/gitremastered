//! Runs the read-only Git commands a snapshot needs, all at the same time.
//!
//! One thread per command: they don't depend on each other, and on Windows each Git process
//! takes ~35 ms to start, so running them one after another made the visualizer miss its
//! 300 ms target (pilot review, docs/measurements.md).
//!
//! Nothing here writes to the repo. `git status` normally refreshes the index file as a side
//! effect; `GIT_OPTIONAL_LOCKS=0` turns that off (Git docs: "git status --no-optional-locks").

use std::thread;

use crate::git_runner::hidden_command::hidden_command;
use crate::git_runner::practice_folder::PracticeFolder;

use super::parse_log::LOG_FORMAT;
use super::parse_refs::REFS_FORMAT;

/// `git status` in a form made for programs: one entry per file, ends marked by zero bytes.
const STATUS_ARGUMENTS: [&str; 5] = [
    "status",
    "--porcelain=v2",
    "--branch",
    "-z",
    "--untracked-files=all",
];

/// Every commit a branch, tag or remote branch reaches, plus (`--reflog`) every commit the
/// reflog still remembers: where HEAD and the branches pointed before. That is how commits
/// "lost" by an amend or a reset stay visible. An empty repo simply prints nothing.
const LOG_ARGUMENTS: [&str; 7] = [
    "log",
    "--branches",
    "--tags",
    "--remotes",
    "--reflog",
    "--date-order",
    LOG_FORMAT,
];

/// Every local branch, remote-tracking branch and tag.
const REFS_ARGUMENTS: [&str; 5] = [
    "for-each-ref",
    REFS_FORMAT,
    "refs/heads",
    "refs/remotes",
    "refs/tags",
];

/// Every file in the latest commit; -z ends each path with a zero byte, so unusual names
/// arrive unquoted. Fails before the first commit (there is no HEAD commit yet).
const TREE_ARGUMENTS: [&str; 5] = ["ls-tree", "-r", "--name-only", "-z", "HEAD"];

/// The repository's own settings, each ended by a zero byte.
const CONFIG_ARGUMENTS: [&str; 4] = ["config", "--local", "--list", "-z"];

/// Every stash entry, newest first: its commit ID and its message, split by 0x1F.
pub const STASH_ARGUMENTS: [&str; 3] = ["stash", "list", "--format=%H%x1f%gs"];

/// What the Git commands printed. Each keeps its own error, because some are expected to
/// fail (the tree listing fails in a repo with no commits).
pub struct GitReadings {
    pub status: Result<String, String>,
    pub log: Result<String, String>,
    pub refs: Result<String, String>,
    pub tree: Result<String, String>,
    pub config: Result<String, String>,
    pub stash: Result<String, String>,
}

/// Runs the read-only Git commands in parallel and waits for all of them.
///
/// Input: the practice folder. Output: each command's output or error.
pub fn run_reads_at_once(folder: &PracticeFolder) -> GitReadings {
    thread::scope(|scope| {
        let status = scope.spawn(|| run_read_only_git(folder, &STATUS_ARGUMENTS));
        let log = scope.spawn(|| run_read_only_git(folder, &LOG_ARGUMENTS));
        let refs = scope.spawn(|| run_read_only_git(folder, &REFS_ARGUMENTS));
        let tree = scope.spawn(|| run_read_only_git(folder, &TREE_ARGUMENTS));
        let config = scope.spawn(|| run_read_only_git(folder, &CONFIG_ARGUMENTS));
        let stash = scope.spawn(|| run_read_only_git(folder, &STASH_ARGUMENTS));
        GitReadings {
            status: finish_thread(status.join()),
            log: finish_thread(log.join()),
            refs: finish_thread(refs.join()),
            tree: finish_thread(tree.join()),
            config: finish_thread(config.join()),
            stash: finish_thread(stash.join()),
        }
    })
}

/// Turns a finished reader thread into its result; a thread that panicked becomes an error.
///
/// Input: what `join` returned. Output: the command's output or an error text.
fn finish_thread(joined: thread::Result<Result<String, String>>) -> Result<String, String> {
    joined.unwrap_or_else(|_| Err("A Git reader thread stopped unexpectedly".to_string()))
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
