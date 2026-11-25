//! `RepoSnapshot`: the state of a practice repository at one moment.
//!
//! Mirrors `app/src/lib/types/repo-snapshot.ts`. Built by repo-inspector (task 15)
//! and sent to the screens with the `repo_changed` event.

use serde::{Deserialize, Serialize};

/// The state of the practice repository at one moment.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepoSnapshot {
    /// Every reachable commit, newest first.
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
}

/// One tag.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Tag {
    /// The tag name, like `v1.0`.
    pub name: String,
    /// The commit the tag points to.
    pub commit_id: String,
}

/// Where HEAD points: at a branch (the usual case) or straight at a commit ("detached").
///
/// In JSON: `{"kind": "branch", "branchName": "main", "commitId": "…" or null}`
/// or `{"kind": "detached", "commitId": "…"}`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(
    tag = "kind",
    rename_all = "camelCase",
    rename_all_fields = "camelCase"
)]
pub enum HeadState {
    /// HEAD follows a branch. `commit_id` is `None` before the first commit.
    Branch {
        branch_name: String,
        commit_id: Option<String>,
    },
    /// HEAD points straight at a commit.
    Detached { commit_id: String },
}

/// What happened to a file.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ChangeKind {
    Added,
    Modified,
    Deleted,
    Renamed,
}

/// One changed file, staged or not.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileChange {
    /// The file's path inside the repository.
    pub path: String,
    /// What happened to it.
    pub change_kind: ChangeKind,
    /// The old path, for renamed files; otherwise `None`.
    pub old_path: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// Builds a small snapshot: one commit on `main`, one staged file, one untracked file.
    ///
    /// Inputs: none. Output: the snapshot.
    fn sample_snapshot() -> RepoSnapshot {
        RepoSnapshot {
            commits: vec![Commit {
                id: "a1b2c3".to_string(),
                message: "Add notes".to_string(),
                parent_ids: vec![],
                author_name: "Student".to_string(),
                authored_at: "2026-11-25T10:00:00+00:00".to_string(),
            }],
            branches: vec![Branch {
                name: "main".to_string(),
                commit_id: "a1b2c3".to_string(),
                is_remote: false,
            }],
            tags: vec![],
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
        assert_eq!(snapshot_json["branches"][0]["isRemote"], false);
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
