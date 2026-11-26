//! Builds a `RepoSnapshot` from a practice folder: runs the read-only Git commands
//! (`git_reads`), hands each output to its own small parser, reads a few facts straight from
//! files (`repo_files`), and puts the pieces together.
//!
//! Never writes to the repo.

use std::collections::{BTreeSet, HashSet};

use crate::git_runner::practice_folder::PracticeFolder;
use crate::models::repo_snapshot::{Branch, FileText, HeadState, Remote, RepoSnapshot, Tag};

use super::committed_texts::read_committed_texts;
use super::git_reads::run_reads_at_once;
use super::parse_config::{parse_config, remotes_from_config};
use super::parse_log::parse_log;
use super::parse_refs::parse_refs;
use super::parse_status::{StatusSummary, parse_status};
use super::reachability::mark_reachability;
use super::repo_files::{find_operation, read_answer, read_remote_tag_names};
use super::workspace_files::{read_submodules, read_working_texts, read_worktrees};

/// One stash entry: the commit Git made for it, and its message.
struct StashEntry {
    commit_id: String,
    message: String,
}

/// Reads the practice repository's current state.
///
/// Input: the practice folder. Output: the snapshot, or a readable error (for example when
/// the folder is not a Git repository yet).
pub fn read_snapshot(folder: &PracticeFolder) -> Result<RepoSnapshot, String> {
    let readings = run_reads_at_once(folder);
    let status = parse_status(&readings.status?);
    let committed_files = committed_files_from(readings.tree, &status.head)?;
    let refs = parse_refs(&readings.refs?);
    let stash_entries = parse_stash_list(&readings.stash.unwrap_or_default());
    let local_config = parse_config(&readings.config?);

    let tip_ids = find_tip_ids(&refs.branches, &refs.tags, &status.head);
    let stash_ids: Vec<String> = stash_entries
        .iter()
        .map(|entry| entry.commit_id.clone())
        .collect();
    let commits = mark_reachability(parse_log(&readings.log?), &tip_ids, &stash_ids);
    let (working_file_texts, committed_file_texts) =
        read_file_texts(folder, &status, &committed_files);

    Ok(RepoSnapshot {
        commits,
        branches: refs.branches,
        tags: refs.tags,
        head: status.head,
        staged_files: status.staged_files,
        modified_files: status.modified_files,
        untracked_files: status.untracked_files,
        committed_files,
        conflicted_files: status.conflicted_files,
        operation: find_operation(folder.path()),
        stashes: stash_entries
            .into_iter()
            .map(|entry| entry.message)
            .collect(),
        remotes: remotes_with_tags(folder, remotes_from_config(&local_config)),
        local_config,
        answer: read_answer(folder.path()),
        working_file_texts,
        committed_file_texts,
        worktrees: read_worktrees(folder.path()),
        submodules: read_submodules(folder.path()),
    })
}

/// Reads the texts of small files, on disk and in the latest commit.
///
/// Inputs: the practice folder, the status, and the files in the latest commit.
/// Output: the working-tree texts and the committed texts.
fn read_file_texts(
    folder: &PracticeFolder,
    status: &StatusSummary,
    committed_files: &[String],
) -> (Vec<FileText>, Vec<FileText>) {
    let staged_paths = status.staged_files.iter().map(|change| change.path.clone());
    let working_paths: BTreeSet<String> = committed_files
        .iter()
        .cloned()
        .chain(status.untracked_files.iter().cloned())
        .chain(staged_paths.clone())
        .collect();
    let working_paths: Vec<String> = working_paths.into_iter().collect();
    let working_texts = read_working_texts(folder.path(), &working_paths);
    let changed_paths: HashSet<String> = staged_paths
        .chain(
            status
                .modified_files
                .iter()
                .map(|change| change.path.clone()),
        )
        .chain(status.conflicted_files.iter().cloned())
        .collect();
    let committed_texts =
        read_committed_texts(folder, committed_files, &working_texts, &changed_paths);
    (working_texts, committed_texts)
}

/// Lists the commits that count as "the end of a line of work": where each branch and tag
/// points, and where HEAD is. Every commit reachable from these is normal history.
///
/// Inputs: the branches, the tags and HEAD. Output: the commit IDs.
fn find_tip_ids(branches: &[Branch], tags: &[Tag], head: &HeadState) -> Vec<String> {
    let branch_tips = branches.iter().map(|branch| branch.commit_id.clone());
    let tag_tips = tags.iter().map(|tag| tag.commit_id.clone());
    let head_tip = head.commit_id().map(str::to_string);
    branch_tips.chain(tag_tips).chain(head_tip).collect()
}

/// Reads the stash list.
///
/// Input: the output of `git stash list` in our format, one entry per line.
/// Output: the entries, newest first.
fn parse_stash_list(stash_output: &str) -> Vec<StashEntry> {
    stash_output
        .lines()
        .filter_map(|line| line.split_once('\u{1f}'))
        .map(|(commit_id, message)| StashEntry {
            commit_id: commit_id.to_string(),
            message: message.to_string(),
        })
        .collect()
}

/// Fills in each remote's tags, for remotes that are folders on this computer.
///
/// Inputs: the practice folder and the remotes. Output: the remotes with their tag names.
fn remotes_with_tags(folder: &PracticeFolder, remotes: Vec<Remote>) -> Vec<Remote> {
    remotes
        .into_iter()
        .map(|remote| Remote {
            tag_names: read_remote_tag_names(folder.path(), &remote.url),
            ..remote
        })
        .collect()
}

/// Lists every file saved in the latest commit (sorted by path, as `git ls-tree` prints them).
///
/// Inputs: the tree listing's result and where HEAD points. Output: the paths; an empty list
/// before the first commit; the listing's error if it failed although HEAD has a commit.
fn committed_files_from(
    tree_listing: Result<String, String>,
    head: &HeadState,
) -> Result<Vec<String>, String> {
    if head.commit_id().is_none() {
        return Ok(Vec::new());
    }
    let tree_output = tree_listing?;
    Ok(tree_output
        .split('\0')
        .filter(|path| !path.is_empty())
        .map(str::to_string)
        .collect())
}
