//! Scripted teammate steps (decision 3): things "a teammate" does on GitHub when a challenge
//! starts, played from the student's own account through the guard. Read from a
//! challenge's `github.teammate` list in challenges.yaml.

use serde::{Deserialize, Serialize};
use serde_json::json;

use super::practice_repo::PracticeRepo;
use super::repo_writes::call_api;

/// One step a teammate takes on the practice repository.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "kebab-case")]
pub enum TeammateStep {
    /// Opens a pull request from `head` into `base`.
    OpenPullRequest {
        head: String,
        base: String,
        title: String,
        #[serde(default)]
        body: String,
    },
    /// Comments on the open pull request whose branch is `head`.
    CommentPullRequest { head: String, body: String },
    /// Merges the open pull request whose branch is `head` (`merge`, `squash` or `rebase`).
    MergePullRequest { head: String, method: String },
    /// Opens an issue.
    CreateIssue {
        title: String,
        #[serde(default)]
        body: String,
        #[serde(default)]
        labels: Vec<String>,
    },
}

/// Runs the steps in order, stopping at the first that fails.
///
/// Inputs: the practice repository and the steps. Output: nothing, or the first error.
pub fn run_teammate_steps(repo: &PracticeRepo, steps: &[TeammateStep]) -> Result<(), String> {
    for step in steps {
        run_one_step(repo, step).map_err(|error| format!("A teammate step failed: {error}"))?;
    }
    Ok(())
}

/// Runs one step.
///
/// Inputs: the practice repository and the step. Output: nothing, or an error.
fn run_one_step(repo: &PracticeRepo, step: &TeammateStep) -> Result<(), String> {
    let full_name = repo.full_name();
    match step {
        TeammateStep::OpenPullRequest {
            head,
            base,
            title,
            body,
        } => {
            let request = json!({ "head": head, "base": base, "title": title, "body": body });
            call_api("POST", &format!("repos/{full_name}/pulls"), Some(&request))?;
        }
        TeammateStep::CommentPullRequest { head, body } => {
            let number = find_open_pull_request(repo, head)?;
            let comment = json!({ "body": body });
            let comments_path = format!("repos/{full_name}/issues/{number}/comments");
            call_api("POST", &comments_path, Some(&comment))?;
        }
        TeammateStep::MergePullRequest { head, method } => {
            let number = find_open_pull_request(repo, head)?;
            let merge = json!({ "merge_method": method });
            call_api(
                "PUT",
                &format!("repos/{full_name}/pulls/{number}/merge"),
                Some(&merge),
            )?;
        }
        TeammateStep::CreateIssue {
            title,
            body,
            labels,
        } => {
            let issue = json!({ "title": title, "body": body, "labels": labels });
            call_api("POST", &format!("repos/{full_name}/issues"), Some(&issue))?;
        }
    }
    Ok(())
}

/// Finds the number of the open pull request whose branch is `head`.
///
/// Inputs: the practice repository and the branch. Output: the number, or an error.
fn find_open_pull_request(repo: &PracticeRepo, head: &str) -> Result<u64, String> {
    let full_name = repo.full_name();
    let owner = full_name.split('/').next().unwrap_or_default();
    let listing_path = format!("repos/{full_name}/pulls?state=open&head={owner}:{head}");
    let listing = call_api("GET", &listing_path, None)?;
    listing
        .as_array()
        .and_then(|pulls| pulls.first())
        .and_then(|pull| pull["number"].as_u64())
        .ok_or_else(|| format!("There is no open pull request for the branch {head}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Steps read from the JSON the screens send (which comes from challenges.yaml).
    #[test]
    fn reads_steps_by_their_action_name() {
        let steps_json = r#"[
            {"action": "open-pull-request", "head": "menu", "base": "main", "title": "Add menu"},
            {"action": "merge-pull-request", "head": "menu", "method": "squash"},
            {"action": "create-issue", "title": "Typo", "labels": ["bug"]}
        ]"#;
        let steps: Vec<TeammateStep> = serde_json::from_str(steps_json).expect("steps parse");
        assert_eq!(steps.len(), 3);
        assert_eq!(
            steps[1],
            TeammateStep::MergePullRequest {
                head: "menu".to_string(),
                method: "squash".to_string()
            }
        );
    }

    /// An unknown action is refused rather than ignored.
    #[test]
    fn refuses_an_unknown_action() {
        let steps_json = r#"[{"action": "delete-repository"}]"#;
        assert!(serde_json::from_str::<Vec<TeammateStep>>(steps_json).is_err());
    }
}
