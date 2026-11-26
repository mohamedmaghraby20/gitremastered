//! The smaller parts of a `RepoSnapshot` that describe the working state of a repository:
//! changed files, an operation in progress, settings and remotes.
//!
//! Mirrors `app/src/lib/types/repo-snapshot.ts`.

use serde::{Deserialize, Serialize};

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
    /// The file's path, relative to the repository's top folder.
    pub path: String,
    /// What happened to it.
    pub change_kind: ChangeKind,
    /// The old path for renamed files, otherwise `None`.
    pub old_path: Option<String>,
}

/// A multi-step Git command that started and is waiting for the student to finish it.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum Operation {
    Merge,
    Rebase,
    Revert,
    CherryPick,
    Bisect,
}

/// One setting from the repository's own config file (`.git/config`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConfigEntry {
    /// The setting's name in lower case, like `user.name`.
    pub key: String,
    /// Its value.
    pub value: String,
}

/// One remote: a short name for another copy of the repository.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Remote {
    /// The remote's name, like `origin`.
    pub name: String,
    /// Where it lives: a URL or a folder path.
    pub url: String,
    /// The tags that exist on the remote. Only known for a remote that is a folder on this
    /// computer (the practice "origin"); empty for a real server, which is never contacted.
    pub tag_names: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// An operation is written in lower case with dashes, as the TypeScript type expects.
    #[test]
    fn operation_serializes_in_kebab_case() {
        let cherry_pick = serde_json::to_value(Operation::CherryPick).expect("serializes");
        assert_eq!(cherry_pick, json!("cherry-pick"));
    }

    /// A remote uses the TypeScript field names.
    #[test]
    fn remote_serializes_with_the_typescript_field_names() {
        let remote = Remote {
            name: "origin".to_string(),
            url: "../origin.git".to_string(),
            tag_names: vec!["v1.0".to_string()],
        };
        let remote_json = serde_json::to_value(remote).expect("serializes");
        assert_eq!(remote_json["tagNames"], json!(["v1.0"]));
    }
}
