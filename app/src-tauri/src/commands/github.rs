//! GitHub commands for the screens (task 84 onwards):
//!
//! - `get_github_connection`: is `gh` installed and signed in, and as whom (read only).
//! - `get_github_state`: one practice repository's state, for the goal checks (read only).
//! - `list_practice_repositories`: the practice repositories on the student's account.
//! - `delete_practice_repositories`: deletes the ones chosen, after Rust's own native dialog.
//! - `get_github_consent`, `grant_github_consent`, `revoke_github_consent`: the consent,
//!   kept by Rust; only a native dialog can grant it.
//!
//! Every call runs `gh` off the main thread, so the window never freezes while GitHub answers.

use tauri::{AppHandle, Runtime};
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

use super::practice::app_data_folder;
use crate::github::connection::{read_connection, require_login};
use crate::github::consent::{consent_dialog_text, has_consent, remove_consent, save_consent};
use crate::github::gh_command::run_gh;
use crate::github::practice_repo::{PracticeRepo, is_practice_name};
use crate::github::repo_writes::delete_repository;
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

/// Deletes the practice repositories the student saw and chose. Rust asks again with its own
/// native dialog that names them (security audit M1), and deletes only names that are still
/// practice repositories on the account now (audit L2). Each is checked again before it goes:
/// it must be one the app made.
///
/// Input: the names the screen listed. Output: the names deleted (an empty list when the
/// student said no), or the first error.
#[tauri::command]
pub async fn delete_practice_repositories<R: Runtime>(
    app: AppHandle<R>,
    confirmed_names: Vec<String>,
) -> Result<Vec<String>, String> {
    run_off_main_thread(move || {
        let login = require_login()?;
        let names_now = list_practice_names()?;
        let names_to_delete: Vec<String> = confirmed_names
            .into_iter()
            .filter(|name| names_now.contains(name))
            .collect();
        if names_to_delete.is_empty() || !ask_before_deleting(&app, &names_to_delete) {
            return Ok(Vec::new());
        }
        let mut deleted = Vec::new();
        for name in names_to_delete {
            let repo = PracticeRepo::new(&login, &name, &login)?;
            delete_repository(&repo, true)?;
            deleted.push(name);
        }
        Ok(deleted)
    })
    .await
}

/// Tells whether the student agreed to practise on GitHub (kept by Rust).
///
/// Input: the app. Output: true once they agreed.
#[tauri::command]
pub async fn get_github_consent<R: Runtime>(app: AppHandle<R>) -> Result<bool, String> {
    Ok(has_consent(&app_data_folder(&app)?))
}

/// Asks for consent with Rust's own native dialog, which says exactly what the app will do,
/// and saves the answer. A script in the web view cannot give this consent: only the dialog can.
///
/// Input: the app. Output: true when the student agreed.
#[tauri::command]
pub async fn grant_github_consent<R: Runtime>(app: AppHandle<R>) -> Result<bool, String> {
    run_off_main_thread(move || {
        let has_agreed = app
            .dialog()
            .message(consent_dialog_text())
            .title("Practice on your GitHub account?")
            .kind(MessageDialogKind::Warning)
            .buttons(MessageDialogButtons::OkCancelCustom(
                "Allow practice on GitHub".to_string(),
                "Not now".to_string(),
            ))
            .blocking_show();
        if has_agreed {
            save_consent(&app_data_folder(&app)?)?;
        }
        Ok(has_agreed)
    })
    .await
}

/// Takes the consent back. No dialog: taking back is always safe.
///
/// Input: the app. Output: nothing, or an error.
#[tauri::command]
pub async fn revoke_github_consent<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    remove_consent(&app_data_folder(&app)?)
}

/// Shows Rust's native "are you sure" dialog before deleting.
///
/// Inputs: the app and the names. Output: true when the student confirmed.
fn ask_before_deleting<R: Runtime>(app: &AppHandle<R>, names: &[String]) -> bool {
    let message = format!(
        "These practice repositories will be deleted from GitHub for good:\n\n{}\n\nThis cannot be undone.",
        names.join("\n")
    );
    app.dialog()
        .message(message)
        .title("Delete practice repositories?")
        .kind(MessageDialogKind::Warning)
        .buttons(MessageDialogButtons::OkCancelCustom(
            "Delete them".to_string(),
            "Keep them".to_string(),
        ))
        .blocking_show()
}

/// Lists the signed-in user's own repositories whose names are practice names.
///
/// Inputs: none. Output: the names, sorted.
fn list_practice_names() -> Result<Vec<String>, String> {
    // Every page, not only the first 100 repositories (code review finding 9): gh follows
    // the pages and prints one name per line.
    let arguments = [
        "api",
        "--paginate",
        "user/repos?affiliation=owner&per_page=100",
        "--jq",
        ".[].name",
    ];
    let listing = run_gh(&arguments, None).map_err(|error| error.to_string())?;
    let mut names: Vec<String> = listing
        .lines()
        .map(str::trim)
        .filter(|name| is_practice_name(name))
        .map(str::to_string)
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
