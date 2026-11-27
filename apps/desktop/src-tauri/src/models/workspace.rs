//! The snapshot's version 3 parts (phase 6): small file texts, linked worktrees and
//! submodules. Mirrors `FileText`, `Worktree` and `Submodule` in
//! `packages/course-engine/src/types/repo-snapshot.ts`.

use serde::{Deserialize, Serialize};

/// One small text file and what it says.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileText {
    /// The path inside the repository, with `/` between folders, like `docs/menu.txt`.
    pub path: String,
    /// The whole file.
    pub text: String,
}

/// A linked worktree: another folder with its own checked-out branch (`git worktree add`).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Worktree {
    /// The folder, as Git recorded it.
    pub path: String,
    /// The branch checked out there, like `hotfix`; `None` when its HEAD is detached.
    pub branch: Option<String>,
}

/// A submodule: another repository kept inside this one, listed in `.gitmodules`.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Submodule {
    /// Where it lives in the working tree, like `vendor/library`.
    pub path: String,
    /// True once its files are checked out (`git submodule update --init`).
    pub is_initialized: bool,
}
