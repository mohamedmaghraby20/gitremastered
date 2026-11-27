//! The repo-inspector module (docs/SPEC.md section 3.2): reads a practice repository's state.
//!
//! - `snapshot`: puts a `RepoSnapshot` together from the pieces below.
//! - `git_reads`: runs the read-only Git commands, all at once.
//! - `parse_status`, `parse_log`, `parse_refs`, `parse_config`: one small parser per Git output.
//! - `reachability`: tells normal history from commits only the reflog remembers.
//! - `repo_files`: facts read straight from files (operation in progress, answer, remote tags).
//! - `workspace_files`: file texts, linked worktrees and submodules, read straight from files.
//! - `committed_texts`: file texts as they are in the latest commit.
//! - `watcher`: watches a practice folder and reports each new snapshot.

pub mod committed_texts;
pub mod git_reads;
pub mod parse_config;
pub mod parse_log;
pub mod parse_refs;
pub mod parse_status;
pub mod reachability;
pub mod repo_files;
pub mod snapshot;
pub mod watcher;
pub mod workspace_files;
