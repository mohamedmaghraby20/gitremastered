//! `RepoSnapshot`: the state of a practice repository at one moment.
//!
//! Mirrors `app/src/lib/types/repo-snapshot.ts`. Built by repo-inspector and sent to the
//! screens with the `repo_changed` event. The smaller parts live in `working_state`.

use serde::{Deserialize, Serialize};

pub use super::working_state::{ChangeKind, ConfigEntry, FileChange, Operation, Remote};
pub use super::workspace::{FileText, Submodule, Worktree};

/// The state of the practice repository at one moment.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoSnapshot {
    /// Every commit Git still remembers, newest first: the ones a branch, tag or HEAD reaches,
    /// and (marked `is_reachable: false`) the ones only the reflog still knows.
    pub commits: Vec<Commit>,
    /// Local and remote-tracking branches.
    pub branches: Vec<Branch>,
    /// Tags.
    pub tags: Vec<Tag>,
    /// Which branch or commit HEAD points to.
    pub head: HeadState,
    /// In the index (staging area), not yet committed.
    pub staged_files: Vec<FileChange>,
    /// Changed in the working folder, not staged.
    pub modified_files: Vec<FileChange>,
    /// New files Git does not track yet (their paths).
    pub untracked_files: Vec<String>,
    /// Every file saved in the latest commit (HEAD), sorted; empty before the first commit.
    pub committed_files: Vec<String>,
    /// Files with a merge conflict that is not resolved yet (they are in `modified_files` too).
    pub conflicted_files: Vec<String>,
    /// A merge, rebase, revert, cherry-pick or bisect that is waiting to be finished.
    pub operation: Option<Operation>,
    /// The message of each stash entry, newest first.
    pub stashes: Vec<String>,
    /// The remotes this repository knows.
    pub remotes: Vec<Remote>,
    /// The repository's own settings (`git config --local`).
    pub local_config: Vec<ConfigEntry>,
    /// The first line of `answer.txt` in the working folder, for challenges that ask the
    /// student to find something out and write it down. `None` without the file.
    pub answer: Option<String>,
    /// Small text files in the working tree, as they are on disk (version 3, phase 6).
    pub working_file_texts: Vec<FileText>,
    /// Small text files as they are in the latest commit (HEAD).
    pub committed_file_texts: Vec<FileText>,
    /// Linked worktrees (not the main one).
    pub worktrees: Vec<Worktree>,
    /// Submodules listed in `.gitmodules`.
    pub submodules: Vec<Submodule>,
    /// Committed files a sparse checkout left out of the working tree.
    pub sparse_skipped_files: Vec<String>,
}

/// One commit.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Commit {
    /// The full 40-character commit ID.
    pub id: String,
    /// The first line of the commit message.
    pub message: String,
    /// The IDs of the parent commits (none for the first commit, two for a merge).
    pub parent_ids: Vec<String>,
    /// Who wrote the change.
    pub author_name: String,
    /// When it was written, as an ISO 8601 date and time.
    pub authored_at: String,
    /// True when a branch, a tag or HEAD reaches this commit. False for a commit that lost
    /// its branch (after an amend or a reset) and lives on only in the reflog.
    pub is_reachable: bool,
    /// True when Git verified a good signature on the commit (`%G?` is `G` or `U`).
    pub is_signed: bool,
    /// The files this commit added, changed or deleted (none for a merge commit).
    pub changed_paths: Vec<String>,
}

/// One branch, local (`main`) or remote-tracking (`origin/main`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Branch {
    /// The branch name, like `main` or `origin/main`.
    pub name: String,
    /// The commit the branch points to.
    pub commit_id: String,
    /// True for remote-tracking branches like `origin/main`.
    pub is_remote: bool,
    /// The remote-tracking branch this branch follows, like `origin/main`; `None` without one.
    pub upstream: Option<String>,
    /// How many commits this branch has that its upstream does not.
    pub ahead: u32,
    /// How many commits the upstream has that this branch does not.
    pub behind: u32,
}

/// One tag.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    /// The tag name, like `v1.0`.
    pub name: String,
    /// The commit the tag points to.
    pub commit_id: String,
    /// True for an annotated tag (a tag with its own message, author and date).
    pub is_annotated: bool,
}

/// Where HEAD points: at a branch (the usual case) or straight at a commit ("detached").
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum HeadState {
    /// HEAD follows a branch. `commit_id` is `None` on a new branch with no commits yet.
    Branch {
        branch_name: String,
        commit_id: Option<String>,
    },
    /// HEAD points straight at a commit.
    Detached { commit_id: String },
}

impl HeadState {
    /// The commit HEAD is on. Input: none. Output: its ID, or `None` before the first commit.
    pub fn commit_id(&self) -> Option<&str> {
        match self {
            Self::Branch { commit_id, .. } => commit_id.as_deref(),
            Self::Detached { commit_id } => Some(commit_id),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// A small snapshot with one commit, one staged file and one untracked file.
    fn sample_snapshot() -> RepoSnapshot {
        RepoSnapshot {
            commits: vec![Commit {
                id: "a1b2c3".to_string(),
                message: "Add notes".to_string(),
                parent_ids: vec![],
                author_name: "Student".to_string(),
                authored_at: "2026-11-25T10:00:00+00:00".to_string(),
                is_reachable: true,
                is_signed: true,
                changed_paths: vec!["notes.txt".to_string()],
            }],
            branches: vec![Branch {
                name: "main".to_string(),
                commit_id: "a1b2c3".to_string(),
                is_remote: false,
                upstream: Some("origin/main".to_string()),
                ahead: 1,
                behind: 0,
            }],
            tags: vec![Tag {
                name: "v1.0".to_string(),
                commit_id: "a1b2c3".to_string(),
                is_annotated: true,
            }],
            head: HeadState::Branch {
                branch_name: "main".to_string(),
                commit_id: Some("a1b2c3".to_string()),
            },
            staged_files: vec![FileChange {
                path: "notes.txt".to_string(),
                change_kind: ChangeKind::Added,
                old_path: None,
            }],
            modified_files: vec![],
            untracked_files: vec!["draft.md".to_string()],
            committed_files: vec!["notes.txt".to_string()],
            conflicted_files: vec!["app.js".to_string()],
            operation: Some(Operation::Merge),
            stashes: vec!["WIP on main: a1b2c3 Add notes".to_string()],
            remotes: vec![],
            local_config: vec![ConfigEntry {
                key: "user.name".to_string(),
                value: "Student".to_string(),
            }],
            answer: Some("42".to_string()),
            working_file_texts: vec![FileText {
                path: "notes.txt".to_string(),
                text: "hello".to_string(),
            }],
            committed_file_texts: vec![],
            worktrees: vec![Worktree {
                path: "/work/hotfix".to_string(),
                branch: Some("hotfix".to_string()),
            }],
            submodules: vec![Submodule {
                path: "vendor/library".to_string(),
                is_initialized: true,
            }],
            sparse_skipped_files: vec![],
        }
    }

    /// The JSON must use the same camelCase names as the TypeScript types.
    #[test]
    fn snapshot_serializes_with_the_typescript_field_names() {
        let snapshot_json = serde_json::to_value(sample_snapshot()).expect("snapshot serializes");

        assert_eq!(snapshot_json["stagedFiles"][0]["changeKind"], "added");
        assert_eq!(snapshot_json["stagedFiles"][0]["oldPath"], json!(null));
        assert_eq!(snapshot_json["untrackedFiles"][0], "draft.md");
        assert_eq!(snapshot_json["committedFiles"][0], "notes.txt");
        assert_eq!(snapshot_json["commits"][0]["parentIds"], json!([]));
        assert_eq!(snapshot_json["commits"][0]["isReachable"], true);
        assert_eq!(snapshot_json["branches"][0]["isRemote"], false);
        assert_eq!(snapshot_json["branches"][0]["upstream"], "origin/main");
        assert_eq!(snapshot_json["branches"][0]["ahead"], 1);
        assert_eq!(snapshot_json["tags"][0]["isAnnotated"], true);
        assert_eq!(snapshot_json["conflictedFiles"][0], "app.js");
        assert_eq!(snapshot_json["operation"], "merge");
        assert_eq!(snapshot_json["stashes"][0], "WIP on main: a1b2c3 Add notes");
        assert_eq!(snapshot_json["localConfig"][0]["key"], "user.name");
        assert_eq!(snapshot_json["answer"], "42");
        assert_eq!(snapshot_json["commits"][0]["isSigned"], true);
        assert_eq!(snapshot_json["commits"][0]["changedPaths"][0], "notes.txt");
        assert_eq!(snapshot_json["workingFileTexts"][0]["text"], "hello");
        assert_eq!(snapshot_json["committedFileTexts"], json!([]));
        assert_eq!(snapshot_json["worktrees"][0]["branch"], "hotfix");
        assert_eq!(snapshot_json["submodules"][0]["isInitialized"], true);
    }

    /// HEAD carries a "kind" tag, so the screens can tell a branch from a detached HEAD.
    #[test]
    fn head_state_serializes_with_a_kind_tag() {
        let on_branch = serde_json::to_value(sample_snapshot().head).expect("head serializes");
        assert_eq!(
            on_branch,
            json!({"kind": "branch", "branchName": "main", "commitId": "a1b2c3"})
        );

        let detached = HeadState::Detached {
            commit_id: "a1b2c3".to_string(),
        };
        let detached_json = serde_json::to_value(detached).expect("head serializes");
        assert_eq!(
            detached_json,
            json!({"kind": "detached", "commitId": "a1b2c3"})
        );
    }

    /// JSON written by one side reads back into the same snapshot.
    #[test]
    fn snapshot_round_trips_through_json() {
        let original = sample_snapshot();
        let snapshot_text = serde_json::to_string(&original).expect("snapshot serializes");
        let read_back: RepoSnapshot =
            serde_json::from_str(&snapshot_text).expect("snapshot parses");
        assert_eq!(read_back, original);
    }
}
