//! Runs the app's own GitHub code for `pnpm test:github` (task 88), so GitHub challenges are
//! tested through the same guard the app uses.
//!
//! Run: `cargo run --example github_practice -- <action>` with a JSON request on standard
//! input. Actions:
//! - `prepare`: `{"repo": "...", "teammate": [...]}` → creates and resets the practice
//!   repository, prints `{"PRACTICE_GITHUB_URL": "..."}` (the setup's environment).
//! - `finish`: the same request → makes `main` the default branch, runs the teammate steps.
//! - `state`: `{"repo": "..."}` → prints the repository's state as JSON.
//!
//! Consent: running this program by hand is the consent (it is a developer tool).

use std::io::Read;
use std::process::ExitCode;

use gitremastered_lib::github::challenge_setup::{
    GitHubChallenge, finish_github_challenge, prepare_github_challenge,
};
use gitremastered_lib::github::connection::require_login;
use gitremastered_lib::github::practice_repo::PracticeRepo;
use gitremastered_lib::github::state::read_state;

/// Reads the action and the request, runs it, prints the result.
///
/// Inputs: none (command line and standard input). Output: exit code 0 on success, 1 on error.
fn main() -> ExitCode {
    let action = std::env::args().nth(1).unwrap_or_default();
    let mut request_text = String::new();
    if std::io::stdin().read_to_string(&mut request_text).is_err() {
        eprintln!("could not read the request");
        return ExitCode::FAILURE;
    }
    match run_action(&action, &request_text) {
        Ok(output) => {
            println!("{output}");
            ExitCode::SUCCESS
        }
        Err(message) => {
            eprintln!("{message}");
            ExitCode::FAILURE
        }
    }
}

/// Runs one action.
///
/// Inputs: the action name and the JSON request. Output: the JSON to print, or an error.
fn run_action(action: &str, request_text: &str) -> Result<String, String> {
    let challenge: GitHubChallenge =
        serde_json::from_str(request_text).map_err(|error| format!("bad request: {error}"))?;
    match action {
        "prepare" => {
            let (_repo, environment) = prepare_github_challenge(&challenge, true)?;
            let variables: serde_json::Map<String, serde_json::Value> = environment
                .into_iter()
                .map(|(name, value)| (name, serde_json::Value::String(value)))
                .collect();
            Ok(serde_json::Value::Object(variables).to_string())
        }
        "finish" => {
            let repo = guarded_repo(&challenge.repo)?;
            finish_github_challenge(&repo, &challenge)?;
            Ok("{}".to_string())
        }
        "state" => {
            let repo = guarded_repo(&challenge.repo)?;
            let state = read_state(&repo)?;
            serde_json::to_string(&state).map_err(|error| error.to_string())
        }
        _ => Err("usage: github_practice prepare|finish|state < request.json".to_string()),
    }
}

/// Makes the guarded repository for the signed-in user.
///
/// Input: the repository's name. Output: the guarded repository, or why it was refused.
fn guarded_repo(name: &str) -> Result<PracticeRepo, String> {
    let login = require_login()?;
    PracticeRepo::new(&login, name, &login)
}
