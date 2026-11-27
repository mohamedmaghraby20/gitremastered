//! Reads one practice repository's state on GitHub for the goal checks: branches, pull
//! requests, issues and releases in one GraphQL call, then the rules on the default branch
//! and the latest workflow runs. Only reads; each call has the `gh` time limit, and the
//! screens ask for it only now and then (assumption A6), never on every snapshot.

use serde_json::Value;

use crate::models::github::{GitHubState, Issue, PullRequest, Release, WorkflowRun};

use super::gh_command::run_gh;
use super::practice_repo::PracticeRepo;
use super::repo_writes::read_api;
use super::url_text::encode_for_url;

/// The GraphQL query: everything except rules and workflow runs, in one round trip.
const STATE_QUERY: &str = "query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    defaultBranchRef { name }
    refs(refPrefix: \"refs/heads/\", first: 50) { nodes { name } }
    pullRequests(last: 30) { nodes { number title state headRefName baseRefName createdAt
      comments { totalCount } reviews { totalCount } } }
    issues(last: 30) { nodes { number title state createdAt labels(first: 10) { nodes { name } } } }
    releases(last: 20) { nodes { tagName name isDraft isPrerelease } }
  }
}";

/// Reads the practice repository's state.
///
/// Input: the practice repository (reading needs no guard, but only practice repositories
/// are ever asked for). Output: the state, or a readable error.
pub fn read_state(repo: &PracticeRepo) -> Result<GitHubState, String> {
    let full_name = repo.full_name();
    let (owner, name) = full_name.split_once('/').unwrap_or_default();
    let query_argument = format!("query={STATE_QUERY}");
    let owner_argument = format!("owner={owner}");
    let name_argument = format!("name={name}");
    let response = run_gh(
        &[
            "api",
            "graphql",
            "-f",
            &query_argument,
            "-f",
            &owner_argument,
            "-f",
            &name_argument,
        ],
        None,
    )
    .map_err(|error| error.to_string())?;
    let response: Value = serde_json::from_str(&response)
        .map_err(|error| format!("GitHub sent unreadable data ({error})"))?;
    let mut state = parse_repository(&full_name, &response["data"]["repository"]);
    if !state.default_branch.is_empty() {
        let branch = encode_for_url(&state.default_branch, true);
        let rules_path = format!("repos/{full_name}/rules/branches/{branch}");
        state.default_branch_rules = read_api(&rules_path)
            .map(|rules| parse_rule_types(&rules))
            .unwrap_or_default();
    }
    let runs_path = format!("repos/{full_name}/actions/runs?per_page=20");
    state.workflow_runs = read_api(&runs_path)
        .map(|runs| parse_workflow_runs(&runs))
        .unwrap_or_default();
    Ok(state)
}

/// Reads the GraphQL answer's `repository` part.
///
/// Inputs: the full name and the JSON. Output: the state without rules and runs.
fn parse_repository(full_name: &str, repository: &Value) -> GitHubState {
    GitHubState {
        repo: full_name.to_string(),
        default_branch: text(&repository["defaultBranchRef"]["name"]),
        branches: nodes(&repository["refs"])
            .iter()
            .map(|node| text(&node["name"]))
            .collect(),
        pull_requests: nodes(&repository["pullRequests"])
            .iter()
            .map(parse_pull_request)
            .collect(),
        issues: nodes(&repository["issues"])
            .iter()
            .map(parse_issue)
            .collect(),
        releases: nodes(&repository["releases"])
            .iter()
            .map(|node| Release {
                tag_name: text(&node["tagName"]),
                name: text(&node["name"]),
                is_draft: node["isDraft"].as_bool().unwrap_or(false),
                is_prerelease: node["isPrerelease"].as_bool().unwrap_or(false),
            })
            .collect(),
        default_branch_rules: Vec::new(),
        workflow_runs: Vec::new(),
    }
}

/// Reads one pull request node. Input: the node. Output: the pull request.
fn parse_pull_request(node: &Value) -> PullRequest {
    PullRequest {
        number: node["number"].as_u64().unwrap_or(0),
        title: text(&node["title"]),
        state: text(&node["state"]).to_lowercase(),
        head_branch: text(&node["headRefName"]),
        base_branch: text(&node["baseRefName"]),
        created_at: text(&node["createdAt"]),
        comment_count: count(&node["comments"]),
        review_count: count(&node["reviews"]),
    }
}

/// Reads one issue node. Input: the node. Output: the issue.
fn parse_issue(node: &Value) -> Issue {
    Issue {
        number: node["number"].as_u64().unwrap_or(0),
        title: text(&node["title"]),
        state: text(&node["state"]).to_lowercase(),
        created_at: text(&node["createdAt"]),
        labels: nodes(&node["labels"])
            .iter()
            .map(|label| text(&label["name"]))
            .collect(),
    }
}

/// Reads the rule types from `GET repos/…/rules/branches/<branch>`.
/// Input: the JSON list. Output: the types, like `pull_request`, without repeats.
fn parse_rule_types(rules: &Value) -> Vec<String> {
    let mut rule_types: Vec<String> = rules
        .as_array()
        .map(|list| list.iter().map(|rule| text(&rule["type"])).collect())
        .unwrap_or_default();
    rule_types.sort();
    rule_types.dedup();
    rule_types
}

/// Reads `GET repos/…/actions/runs`. Input: the JSON. Output: the runs, newest first.
fn parse_workflow_runs(runs: &Value) -> Vec<WorkflowRun> {
    runs["workflow_runs"]
        .as_array()
        .map(|list| {
            list.iter()
                .map(|run| WorkflowRun {
                    name: text(&run["name"]),
                    head_branch: text(&run["head_branch"]),
                    status: text(&run["status"]),
                    conclusion: run["conclusion"].as_str().map(str::to_string),
                    created_at: text(&run["created_at"]),
                })
                .collect()
        })
        .unwrap_or_default()
}

/// The `nodes` list of a GraphQL connection. Input: the connection. Output: its nodes.
fn nodes(connection: &Value) -> Vec<Value> {
    connection["nodes"].as_array().cloned().unwrap_or_default()
}

/// A JSON string, or empty text. Input: the value. Output: the text.
fn text(value: &Value) -> String {
    value.as_str().unwrap_or_default().to_string()
}

/// A GraphQL `totalCount`. Input: the connection. Output: the count.
fn count(connection: &Value) -> u32 {
    connection["totalCount"]
        .as_u64()
        .and_then(|total| u32::try_from(total).ok())
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    /// A GraphQL answer becomes the state, with lower-case states.
    #[test]
    fn reads_the_graphql_answer() {
        let repository = json!({
            "defaultBranchRef": {"name": "main"},
            "refs": {"nodes": [{"name": "main"}, {"name": "menu"}]},
            "pullRequests": {"nodes": [{"number": 1, "title": "Add menu", "state": "MERGED",
                "headRefName": "menu", "baseRefName": "main", "createdAt": "2026-11-27T10:00:00Z",
                "comments": {"totalCount": 2}, "reviews": {"totalCount": 1}}]},
            "issues": {"nodes": [{"number": 2, "title": "Typo", "state": "OPEN",
                "createdAt": "2026-11-27T10:00:00Z", "labels": {"nodes": [{"name": "bug"}]}}]},
            "releases": {"nodes": [{"tagName": "v1.0", "name": "First", "isDraft": false,
                "isPrerelease": false}]}
        });

        let state = parse_repository("octo/gitremastered-practice-flow", &repository);

        assert_eq!(state.default_branch, "main");
        assert_eq!(state.branches, vec!["main", "menu"]);
        assert_eq!(state.pull_requests[0].state, "merged");
        assert_eq!(state.pull_requests[0].comment_count, 2);
        assert_eq!(state.issues[0].labels, vec!["bug"]);
        assert_eq!(state.releases[0].tag_name, "v1.0");
    }

    /// Rules and runs come from their own REST answers.
    #[test]
    fn reads_rules_and_runs() {
        let rules =
            json!([{"type": "pull_request"}, {"type": "deletion"}, {"type": "pull_request"}]);
        assert_eq!(parse_rule_types(&rules), vec!["deletion", "pull_request"]);

        let runs = json!({"workflow_runs": [{"name": "CI", "head_branch": "main",
            "status": "completed", "conclusion": "success", "created_at": "2026-11-27T10:00:00Z"}]});
        let parsed = parse_workflow_runs(&runs);
        assert_eq!(parsed[0].conclusion, Some("success".to_string()));
    }
}
