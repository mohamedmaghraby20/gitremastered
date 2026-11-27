//! `open_practice_repo`, `reset_practice_repo`, `find_practice_repo` and
//! `find_github_challenge_start`: open, rebuild or find a lesson's practice folder under the
//! app's local data folder, `<app data>/practice/<practiceId>/`.
//!
//! After building it, the folder is watched: every change sends a `repo_changed` event with
//! the new snapshot (the first one right away), so the visualizer and challenge stay live.
//!
//! Only one build runs at a time (`PracticeBuildLock`): a GitHub build takes many seconds,
//! and a second click must not build into the same folder or reset the same repository.

use std::path::PathBuf;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager, Runtime, State};

use crate::git_runner::practice_folder::{PracticeError, PracticeFolder, PracticeRoot};
use crate::git_runner::terminal_session::TerminalSessions;
use crate::github::challenge_setup::{
    GitHubChallenge, finish_github_challenge, prepare_github_challenge,
};
use crate::github::consent::has_consent;
use crate::repo_inspector::snapshot::read_snapshot;
use crate::repo_inspector::watcher::{ActiveRepoWatcher, RepoWatcher};

/// The event name for a new snapshot (docs/SPEC.md section 3.3).
const REPO_CHANGED_EVENT: &str = "repo_changed";

/// Held for the whole of a build, so two builds never run at once (code review finding 1).
#[derive(Default)]
pub struct PracticeBuildLock(Mutex<()>);

/// Finds the app's local data folder.
///
/// Input: the app handle. Output: the folder, or a readable error.
pub fn app_data_folder<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    app.path()
        .app_local_data_dir()
        .map_err(|error| format!("Could not find the app's data folder ({error})"))
}

/// Opens the practice root inside the app's local data folder.
///
/// Input: the app handle. Output: the practice root, or a readable error.
pub fn open_practice_root<R: Runtime>(app: &AppHandle<R>) -> Result<PracticeRoot, String> {
    PracticeRoot::open(app_data_folder(app)?.join("practice")).map_err(|error| error.to_string())
}

/// Opens a lesson's practice folder as the student left it, or builds it from its setup
/// steps if there is none yet (or the steps changed).
///
/// A GitHub challenge (one with a `github` field) also prepares its practice repository on
/// GitHub when the folder is rebuilt, and only with the consent Rust keeps.
///
/// Inputs: the practice ID, setup steps (from challenges.yaml) and the GitHub field (if any).
/// Output: the folder's path.
#[tauri::command]
pub async fn open_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    build_lock: State<'_, PracticeBuildLock>,
    active_watcher: State<'_, ActiveRepoWatcher>,
    terminal_sessions: State<'_, TerminalSessions>,
    practice_id: String,
    setup_steps: Vec<String>,
    github: Option<GitHubChallenge>,
) -> Result<String, String> {
    let _only_build = build_lock
        .0
        .lock()
        .map_err(|_| "A build stopped unexpectedly".to_string())?;
    let practice_root = open_practice_root(&app)?;
    // Stop watching and stop the shells first: the folder may be deleted and built again.
    active_watcher.replace(None);
    terminal_sessions.close_all()?;
    let is_kept = practice_root
        .is_built_with(&practice_id, &setup_steps)
        .map_err(|error| error.to_string())?;
    let folder = match github {
        Some(challenge) if !is_kept => build_github_challenge(
            &app,
            &practice_root,
            &practice_id,
            &challenge,
            |environment| {
                practice_root.create_with_environment(&practice_id, &setup_steps, environment)
            },
        )?,
        _ => practice_root
            .open_or_create(&practice_id, &setup_steps)
            .map_err(|error| error.to_string())?,
    };
    watch_and_announce(&app, &active_watcher, &folder)?;
    Ok(folder.path().display().to_string())
}

/// Deletes a lesson's practice folder and builds it again from its saved setup steps.
///
/// Inputs: the practice ID, and for a GitHub challenge its GitHub field.
/// Output: the folder's path.
#[tauri::command]
pub async fn reset_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    build_lock: State<'_, PracticeBuildLock>,
    active_watcher: State<'_, ActiveRepoWatcher>,
    terminal_sessions: State<'_, TerminalSessions>,
    practice_id: String,
    github: Option<GitHubChallenge>,
) -> Result<String, String> {
    let _only_build = build_lock
        .0
        .lock()
        .map_err(|_| "A build stopped unexpectedly".to_string())?;
    let practice_root = open_practice_root(&app)?;
    active_watcher.replace(None);
    terminal_sessions.close_all()?;
    let folder = match github {
        Some(challenge) => build_github_challenge(
            &app,
            &practice_root,
            &practice_id,
            &challenge,
            |environment| practice_root.reset_with_environment(&practice_id, environment),
        )?,
        None => practice_root
            .reset(&practice_id)
            .map_err(|error| error.to_string())?,
    };
    watch_and_announce(&app, &active_watcher, &folder)?;
    Ok(folder.path().display().to_string())
}

/// Finds a lesson's practice folder without creating or changing it, so a screen like home
/// can show where the student left the repository.
///
/// Input: the practice ID. Output: the folder's path, or `None` if it was never built.
#[tauri::command]
pub async fn find_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    practice_id: String,
) -> Result<Option<String>, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .find(&practice_id)
        .map_err(|error| error.to_string())?;
    Ok(folder.map(|found| found.path().display().to_string()))
}

/// Tells when the lesson's GitHub challenge attempt started, by GitHub's clock. GitHub goals
/// count only pull requests, issues and runs made from then on.
///
/// Input: the practice ID. Output: the time (ISO 8601), or `None` if no GitHub attempt was built.
#[tauri::command]
pub async fn find_github_challenge_start<R: Runtime>(
    app: AppHandle<R>,
    practice_id: String,
) -> Result<Option<String>, String> {
    let practice_root = open_practice_root(&app)?;
    practice_root
        .read_github_start(&practice_id)
        .map_err(|error| error.to_string())
}

/// Builds a GitHub challenge's folder: prepares the practice repository on GitHub, saves the
/// attempt's start, runs the local build with `PRACTICE_GITHUB_URL` set, then the teammate
/// steps. If those last steps fail, the folder is marked unfinished so the next open builds
/// it again instead of keeping a half-made challenge.
///
/// Inputs: the app, the practice root, the practice ID, the GitHub field, and the local build
/// (given the environment). Output: the folder, or a readable error.
fn build_github_challenge<R: Runtime>(
    app: &AppHandle<R>,
    practice_root: &PracticeRoot,
    practice_id: &str,
    challenge: &GitHubChallenge,
    build_locally: impl FnOnce(&[(String, String)]) -> Result<PracticeFolder, PracticeError>,
) -> Result<PracticeFolder, String> {
    let consent = has_consent(&app_data_folder(app)?);
    let prepared = prepare_github_challenge(challenge, consent)?;
    practice_root
        .save_github_start(practice_id, &prepared.started_at)
        .map_err(|error| error.to_string())?;
    let folder = build_locally(&prepared.environment).map_err(|error| error.to_string())?;
    if let Err(problem) = finish_github_challenge(&prepared, challenge) {
        let _ = practice_root.mark_not_ready(practice_id);
        return Err(problem);
    }
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
