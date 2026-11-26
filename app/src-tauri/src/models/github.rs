//! What the app knows about GitHub: the student's connection, and the state of one practice
//! repository there. Mirrors `app/src/lib/types/github.ts`.

use serde::{Deserialize, Serialize};

/// Whether the app can reach GitHub through the student's own `gh` login.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubConnection {
    /// True when the `gh` program was found.
    pub is_gh_installed: bool,
    /// True when `gh` is signed in to github.com.
    pub is_signed_in: bool,
    /// The signed-in user's login, like `octocat`.
    pub login: Option<String>,
    /// True when the login may delete repositories (the `delete_repo` scope).
    pub can_delete_repos: bool,
}

/// One practice repository on GitHub, as the goal checks need it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubState {
    /// The repository as `owner/name`.
    pub repo: String,
    /// The default branch, like `main`; empty in a repository with no commits.
    pub default_branch: String,
    /// Every branch on GitHub.
    pub branches: Vec<String>,
    /// The newest pull requests (up to 30), newest last.
    pub pull_requests: Vec<PullRequest>,
    /// The newest issues (up to 30), newest last; pull requests are not included.
    pub issues: Vec<Issue>,
    /// The newest releases (up to 20).
    pub releases: Vec<Release>,
    /// The kinds of rule that protect the default branch, like `pull_request`.
    pub default_branch_rules: Vec<String>,
    /// The newest workflow runs of GitHub Actions (up to 20), newest first.
    pub workflow_runs: Vec<WorkflowRun>,
}

/// One pull request.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    pub number: u64,
    pub title: String,
    /// `open`, `closed` or `merged`.
    pub state: String,
    /// The branch with the changes.
    pub head_branch: String,
    /// The branch it asks to merge into.
    pub base_branch: String,
    /// When it was opened, ISO 8601.
    pub created_at: String,
    /// Comments in the conversation.
    pub comment_count: u32,
    /// Reviews submitted (comment, approve or request changes).
    pub review_count: u32,
}

/// One issue.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Issue {
    pub number: u64,
    pub title: String,
    /// `open` or `closed`.
    pub state: String,
    /// When it was opened, ISO 8601.
    pub created_at: String,
    /// Its label names.
    pub labels: Vec<String>,
}

/// One release.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Release {
    /// The tag it is made from, like `v1.0`.
    pub tag_name: String,
    /// Its title.
    pub name: String,
    pub is_draft: bool,
    pub is_prerelease: bool,
}

/// One run of a GitHub Actions workflow.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WorkflowRun {
    /// The workflow's name, from its `name:` line.
    pub name: String,
    /// The branch it ran on.
    pub head_branch: String,
    /// `queued`, `in_progress` or `completed`.
    pub status: String,
    /// `success`, `failure`… once completed; `None` before.
    pub conclusion: Option<String>,
    /// When it started, ISO 8601.
    pub created_at: String,
}
