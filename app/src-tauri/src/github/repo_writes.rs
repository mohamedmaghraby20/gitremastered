//! Every write the app makes on GitHub. Each function takes a `PracticeRepo`, which only the
//! guard can make, so none of them can touch another repository.
//!
//! - `create_if_missing`: makes the public practice repository the first time.
//! - `reset_to_clean`: before a challenge is rebuilt, closes open pull requests and issues,
//!   deletes releases and rules, and puts the merge settings back (assumption A1: the
//!   repository is never deleted on reset; the setup then force-pushes the starting state).
//! - `use_main_as_default`: after the setup pushed `main`.
//! - `delete_repository`: only with the student's consent and the `delete_repo` scope.

use serde_json::{Value, json};

use super::gh_command::{GhError, run_gh};
use super::practice_repo::PracticeRepo;

/// What the app writes in the description of each practice repository it creates.
const REPO_DESCRIPTION: &str = "Practice repository made by the GitRemastered app. Safe to delete.";

/// What GitHub says about a practice repository's name.
#[derive(Debug, PartialEq, Eq)]
enum Lookup {
    /// No repository has this name.
    Missing,
    /// The name answers with a repository the app made: same name, the app's description.
    MadeByApp,
    /// The name redirects to a repository with another name or owner: the practice repository
    /// was renamed or transferred. Writing through the old name would reach that repository.
    Redirected,
    /// A repository with exactly this name exists, but the app did not make it.
    NotMadeByApp,
}

/// Looks a practice repository's name up on GitHub and says what it reaches (security audit
/// H1: GitHub redirects an old name after a rename or transfer, even for writes and pushes).
///
/// Input: the practice repository. Output: what the name reaches, or an error.
fn look_up(repo: &PracticeRepo) -> Result<Lookup, String> {
    let lookup_path = format!("repos/{}", repo.full_name());
    let answer = match run_gh(&["api", &lookup_path], None) {
        Ok(answer) => answer,
        Err(GhError::Failed(message))
            if message.contains("404") || message.contains("Not Found") =>
        {
            return Ok(Lookup::Missing);
        }
        Err(error) => return Err(error.to_string()),
    };
    let found: Value = serde_json::from_str(&answer)
        .map_err(|error| format!("GitHub sent unreadable data ({error})"))?;
    Ok(classify_lookup(&found, &repo.full_name()))
}

/// Decides what a looked-up repository is, from GitHub's answer.
///
/// Inputs: the answer's JSON and the name that was asked for. Output: the kind of answer.
fn classify_lookup(found: &Value, asked_full_name: &str) -> Lookup {
    let found_full_name = found["full_name"].as_str().unwrap_or_default();
    if !found_full_name.eq_ignore_ascii_case(asked_full_name) {
        return Lookup::Redirected;
    }
    let is_fork = found["fork"].as_bool().unwrap_or(false);
    let has_app_description = found["description"].as_str() == Some(REPO_DESCRIPTION);
    if is_fork || !has_app_description {
        return Lookup::NotMadeByApp;
    }
    Lookup::MadeByApp
}

/// Refuses to go on unless the name reaches a repository the app made.
///
/// Input: the practice repository. Output: nothing, or a sentence saying why not.
fn require_made_by_app(repo: &PracticeRepo) -> Result<(), String> {
    match look_up(repo)? {
        Lookup::MadeByApp => Ok(()),
        Lookup::Missing => Err(format!("{} does not exist on GitHub", repo.full_name())),
        Lookup::Redirected | Lookup::NotMadeByApp => Err(not_ours_message(repo)),
    }
}

/// The sentence shown when a name does not reach one of the app's own repositories.
///
/// Input: the practice repository. Output: the sentence.
fn not_ours_message(repo: &PracticeRepo) -> String {
    format!(
        "{} is not a repository the app made (it was renamed, moved, or made by hand), so the app will not change it",
        repo.full_name()
    )
}

/// Creates the practice repository (public, empty) unless the app's own one is there already.
/// A renamed or moved practice repository leaves a redirect behind; creating a new repository
/// under the old name ends that redirect, so writes never reach the moved one.
///
/// Input: the practice repository. Output: true when it was created now, or an error.
pub fn create_if_missing(repo: &PracticeRepo) -> Result<bool, String> {
    match look_up(repo)? {
        Lookup::MadeByApp => return Ok(false),
        Lookup::NotMadeByApp => return Err(not_ours_message(repo)),
        Lookup::Missing | Lookup::Redirected => {}
    }
    let body = json!({
        "name": repo.name(),
        "description": REPO_DESCRIPTION,
        "private": false,
        "has_wiki": false,
        "auto_init": false,
    });
    call_api("POST", "user/repos", Some(&body))?;
    Ok(true)
}

/// Clears what an earlier attempt left on GitHub, so the challenge starts clean.
///
/// Input: the practice repository. Output: nothing, or the first error.
pub fn reset_to_clean(repo: &PracticeRepo) -> Result<(), String> {
    require_made_by_app(repo)?;
    let full_name = repo.full_name();
    for number in list_numbers(
        &format!("repos/{full_name}/pulls?state=open&per_page=100"),
        false,
    )? {
        let closed = json!({ "state": "closed" });
        call_api(
            "PATCH",
            &format!("repos/{full_name}/pulls/{number}"),
            Some(&closed),
        )?;
    }
    for number in list_numbers(
        &format!("repos/{full_name}/issues?state=open&per_page=100"),
        true,
    )? {
        let closed = json!({ "state": "closed" });
        call_api(
            "PATCH",
            &format!("repos/{full_name}/issues/{number}"),
            Some(&closed),
        )?;
    }
    for release_id in list_ids(&format!("repos/{full_name}/releases?per_page=100"))? {
        call_api(
            "DELETE",
            &format!("repos/{full_name}/releases/{release_id}"),
            None,
        )?;
    }
    for ruleset_id in list_ids(&format!("repos/{full_name}/rulesets"))? {
        call_api(
            "DELETE",
            &format!("repos/{full_name}/rulesets/{ruleset_id}"),
            None,
        )?;
    }
    // A classic protection rule from an earlier attempt; there is usually none (404).
    let _ = call_api(
        "DELETE",
        &format!("repos/{full_name}/branches/main/protection"),
        None,
    );
    let settings = json!({
        "allow_merge_commit": true,
        "allow_squash_merge": true,
        "allow_rebase_merge": true,
        "delete_branch_on_merge": false,
        "has_issues": true,
    });
    call_api("PATCH", &format!("repos/{full_name}"), Some(&settings))?;
    Ok(())
}

/// Makes `main` the default branch, once the setup has pushed it.
///
/// Input: the practice repository. Output: nothing, or an error.
pub fn use_main_as_default(repo: &PracticeRepo) -> Result<(), String> {
    require_made_by_app(repo)?;
    let body = json!({ "default_branch": "main" });
    call_api("PATCH", &format!("repos/{}", repo.full_name()), Some(&body)).map(|_| ())
}

/// Deletes a practice repository for good. GitHub needs the `delete_repo` scope for it.
///
/// Inputs: the practice repository and the student's consent. Output: nothing, or an error.
pub fn delete_repository(repo: &PracticeRepo, has_consent: bool) -> Result<(), String> {
    if !has_consent {
        return Err("Deleting needs your consent first".to_string());
    }
    require_made_by_app(repo)?;
    call_api("DELETE", &format!("repos/{}", repo.full_name()), None).map(|_| ())
}

/// Reads from the GitHub API (GET only). The only API access outside this module, so no
/// other code can write to GitHub (security audit, hardening 1).
///
/// Input: the API path. Output: the response's JSON, or a readable error.
pub fn read_api(api_path: &str) -> Result<Value, String> {
    call_api("GET", api_path, None)
}

/// Calls the GitHub API through `gh api`, sending the body (if any) on standard input.
/// Only this module and the teammate steps (which build paths from a `PracticeRepo`) use it.
///
/// Inputs: the HTTP method, the API path and the JSON body. Output: the response's JSON
/// (`Null` when there is no body), or a readable error.
pub(super) fn call_api(
    method: &str,
    api_path: &str,
    body: Option<&Value>,
) -> Result<Value, String> {
    let body_text = body.map(Value::to_string);
    let mut arguments = vec!["api", "-X", method, api_path];
    if body_text.is_some() {
        arguments.extend(["--input", "-"]);
    }
    let output = run_gh(&arguments, body_text.as_deref()).map_err(|error| error.to_string())?;
    if output.trim().is_empty() {
        return Ok(Value::Null);
    }
    serde_json::from_str(&output).map_err(|error| format!("GitHub sent unreadable data ({error})"))
}

/// Lists the numbers of the pull requests or issues an API path returns.
///
/// Inputs: the path, and whether to leave pull requests out (the issues API lists both).
/// Output: the numbers.
fn list_numbers(api_path: &str, skip_pull_requests: bool) -> Result<Vec<u64>, String> {
    let listing = call_api("GET", api_path, None)?;
    let entries = listing.as_array().cloned().unwrap_or_default();
    Ok(entries
        .iter()
        .filter(|entry| !skip_pull_requests || entry.get("pull_request").is_none())
        .filter_map(|entry| entry["number"].as_u64())
        .collect())
}

/// Lists the `id` of each entry an API path returns.
///
/// Input: the path. Output: the IDs.
fn list_ids(api_path: &str) -> Result<Vec<u64>, String> {
    let listing = call_api("GET", api_path, None)?;
    let entries = listing.as_array().cloned().unwrap_or_default();
    Ok(entries
        .iter()
        .filter_map(|entry| entry["id"].as_u64())
        .collect())
}
