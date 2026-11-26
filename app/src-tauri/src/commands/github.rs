//! GitHub commands for the screens (task 84 onwards):
//!
//! - `get_github_connection`: is `gh` installed and signed in, and as whom (read only).
//! - `get_github_state`: one practice repository's state, for the goal checks (read only).
//! - `list_practice_repositories`: the practice repositories on the student's account.
//! - `delete_practice_repositories`: deletes them, only with consent (and the scope).
//!
//! Every call runs `gh` off the main thread, so the window never freezes while GitHub answers.

use crate::github::connection::{read_connection, require_login};
use crate::github::practice_repo::{PracticeRepo, is_practice_name};
use crate::github::repo_writes::{call_api, delete_repository};
use crate::github::state::read_state;
use crate::models::github::{GitHubConnection, GitHubState};

/// Reads the student's GitHub connection.
///
/// Inputs: none. Output: the connection (never an error: problems mean "not connected").
#[tauri::command]
pub async fn get_github_connection() -> Result<GitHubConnection, String> {
    run_off_main_thread(|| Ok(read_connection())).await
}

/// Reads one practice repository's state on GitHub.
///
/// Input: the repository's name, like `gitremastered-practice-flow`. Output: its state.
#[tauri::command]
pub async fn get_github_state(repo_name: String) -> Result<GitHubState, String> {
    run_off_main_thread(move || {
        let login = require_login()?;
        let repo = PracticeRepo::new(&login, &repo_name, &login)?;
        read_state(&repo)
    })
    .await
}

/// Lists the practice repositories on the signed-in account.
///
/// Inputs: none. Output: their names, sorted.
#[tauri::command]
pub async fn list_practice_repositories() -> Result<Vec<String>, String> {
    run_off_main_thread(|| {
        require_login()?;
        list_practice_names()
    })
    .await
}

/// Deletes every practice repository on the signed-in account.
///
/// Input: the student's consent. Output: the names deleted, or the first error.
#[tauri::command]
pub async fn delete_practice_repositories(has_consent: bool) -> Result<Vec<String>, String> {
    run_off_main_thread(move || {
        let login = require_login()?;
        let mut deleted = Vec::new();
        for name in list_practice_names()? {
            let repo = PracticeRepo::new(&login, &name, &login)?;
            delete_repository(&repo, has_consent)?;
            deleted.push(name);
        }
        Ok(deleted)
    })
    .await
}

/// Lists the signed-in user's own repositories whose names are practice names.
///
/// Inputs: none. Output: the names, sorted.
fn list_practice_names() -> Result<Vec<String>, String> {
    let listing = call_api("GET", "user/repos?affiliation=owner&per_page=100", None)?;
    let mut names: Vec<String> = listing
        .as_array()
        .cloned()
        .unwrap_or_default()
        .iter()
        .filter_map(|repo| repo["name"].as_str().map(str::to_string))
        .filter(|name| is_practice_name(name))
        .collect();
    names.sort();
    Ok(names)
}

/// Runs blocking work (a `gh` call) on a worker thread and waits for it.
///
/// Input: the work. Output: its result.
async fn run_off_main_thread<T, F>(work: F) -> Result<T, String>
where
    T: Send + 'static,
    F: FnOnce() -> Result<T, String> + Send + 'static,
{
    tauri::async_runtime::spawn_blocking(work)
        .await
        .map_err(|error| format!("The GitHub check stopped unexpectedly ({error})"))?
}
