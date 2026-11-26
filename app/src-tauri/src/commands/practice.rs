//! `open_practice_repo`, `reset_practice_repo` and `find_practice_repo`: open, rebuild or find
//! a mission's practice folder under the app's local data folder, `<app data>/practice/<missionId>/`.
//!
//! After building it, the folder is watched: every change sends a `repo_changed` event with
//! the new snapshot (the first one right away), so the visualizer and mission stay live.

use tauri::{AppHandle, Emitter, Manager, Runtime, State};

use crate::git_runner::practice_folder::{PracticeFolder, PracticeRoot};
use crate::git_runner::terminal_session::TerminalSessions;
use crate::github::challenge_setup::{
    GitHubChallenge, finish_github_challenge, prepare_github_challenge,
};
use crate::repo_inspector::snapshot::read_snapshot;
use crate::repo_inspector::watcher::{ActiveRepoWatcher, RepoWatcher};

/// The event name for a new snapshot (SPEC.md section 3.3).
const REPO_CHANGED_EVENT: &str = "repo_changed";

/// Opens the practice root inside the app's local data folder.
///
/// Input: the app handle. Output: the practice root, or a readable error.
pub fn open_practice_root<R: Runtime>(app: &AppHandle<R>) -> Result<PracticeRoot, String> {
    let data_folder = app
        .path()
        .app_local_data_dir()
        .map_err(|error| format!("Could not find the app's data folder ({error})"))?;
    PracticeRoot::open(data_folder.join("practice")).map_err(|error| error.to_string())
}

/// Opens a mission's practice folder as the student left it, or builds it from its setup
/// steps if there is none yet (or the steps changed).
///
/// A GitHub challenge (one with a `github` field) also prepares its practice repository on
/// GitHub when the folder is rebuilt, and only with the student's consent.
///
/// Inputs: the mission ID, setup steps (from challenges.yaml), the GitHub field (if any)
/// and the consent. Output: the folder's path.
#[tauri::command]
pub async fn open_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    active_watcher: State<'_, ActiveRepoWatcher>,
    terminal_sessions: State<'_, TerminalSessions>,
    mission_id: String,
    setup_steps: Vec<String>,
    github: Option<GitHubChallenge>,
    github_consent: Option<bool>,
) -> Result<String, String> {
    let practice_root = open_practice_root(&app)?;
    // Stop watching and stop the shells first: the folder may be deleted and built again.
    active_watcher.replace(None);
    terminal_sessions.close_all()?;
    let is_kept = practice_root
        .is_built_with(&mission_id, &setup_steps)
        .map_err(|error| error.to_string())?;
    let folder = match github {
        Some(challenge) if !is_kept => {
            build_github_challenge(&challenge, github_consent.unwrap_or(false), |environment| {
                practice_root.create_with_environment(&mission_id, &setup_steps, environment)
            })?
        }
        _ => practice_root
            .open_or_create(&mission_id, &setup_steps)
            .map_err(|error| error.to_string())?,
    };
    watch_and_announce(&app, &active_watcher, &folder)?;
    Ok(folder.path().display().to_string())
}

/// Deletes a mission's practice folder and builds it again from its saved setup steps.
///
/// Inputs: the mission ID, and for a GitHub challenge its GitHub field and the consent.
/// Output: the folder's path.
#[tauri::command]
pub async fn reset_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    active_watcher: State<'_, ActiveRepoWatcher>,
    terminal_sessions: State<'_, TerminalSessions>,
    mission_id: String,
    github: Option<GitHubChallenge>,
    github_consent: Option<bool>,
) -> Result<String, String> {
    let practice_root = open_practice_root(&app)?;
    active_watcher.replace(None);
    terminal_sessions.close_all()?;
    let folder = match github {
        Some(challenge) => {
            build_github_challenge(&challenge, github_consent.unwrap_or(false), |environment| {
                practice_root.reset_with_environment(&mission_id, environment)
            })?
        }
        None => practice_root
            .reset(&mission_id)
            .map_err(|error| error.to_string())?,
    };
    watch_and_announce(&app, &active_watcher, &folder)?;
    Ok(folder.path().display().to_string())
}

/// Finds a mission's practice folder without creating or changing it, so a screen like home
/// can show where the student left the repository.
///
/// Input: the mission ID. Output: the folder's path, or `None` if it was never built.
#[tauri::command]
pub async fn find_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    mission_id: String,
) -> Result<Option<String>, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .find(&mission_id)
        .map_err(|error| error.to_string())?;
    Ok(folder.map(|found| found.path().display().to_string()))
}

/// Builds a GitHub challenge's folder: prepares the practice repository on GitHub, runs the
/// local build with `PRACTICE_GITHUB_URL` set, then the teammate steps.
///
/// Inputs: the GitHub field, the consent, and the local build (given the environment).
/// Output: the folder, or a readable error.
fn build_github_challenge(
    challenge: &GitHubChallenge,
    has_consent: bool,
    build_locally: impl FnOnce(
        &[(String, String)],
    ) -> Result<
        PracticeFolder,
        crate::git_runner::practice_folder::PracticeError,
    >,
) -> Result<PracticeFolder, String> {
    let prepared = prepare_github_challenge(challenge, has_consent)?;
    let folder = build_locally(&prepared.environment).map_err(|error| error.to_string())?;
    finish_github_challenge(&prepared, challenge)?;
    Ok(folder)
}

/// Starts watching a folder, sends its first snapshot, and keeps the watcher as the active one.
///
/// Inputs: the app, the active-watcher holder, and the folder. Output: nothing, or an error.
fn watch_and_announce<R: Runtime>(
    app: &AppHandle<R>,
    active_watcher: &ActiveRepoWatcher,
    folder: &PracticeFolder,
) -> Result<(), String> {
    let event_app = app.clone();
    let watcher = RepoWatcher::start(folder.clone(), move |snapshot| {
        let _ = event_app.emit(REPO_CHANGED_EVENT, snapshot);
    })?;
    active_watcher.replace(Some(watcher));
    if let Ok(first_snapshot) = read_snapshot(folder) {
        let _ = app.emit(REPO_CHANGED_EVENT, first_snapshot);
    }
    Ok(())
}
