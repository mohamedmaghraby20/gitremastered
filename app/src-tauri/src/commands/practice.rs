//! `create_practice_repo` and `reset_practice_repo`: build a mission's practice folder
//! under the app's local data folder, `<app data>/practice/<missionId>/`.

use tauri::{AppHandle, Manager, Runtime};

use crate::git_runner::practice_folder::PracticeRoot;

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

/// Creates a fresh practice folder for a mission and runs its setup steps inside it.
///
/// Inputs: the mission ID and setup steps (from mission.yaml). Output: the folder's path.
#[tauri::command]
pub async fn create_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    mission_id: String,
    setup_steps: Vec<String>,
) -> Result<String, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .create(&mission_id, &setup_steps)
        .map_err(|error| error.to_string())?;
    Ok(folder.path().display().to_string())
}

/// Deletes a mission's practice folder and builds it again from its saved setup steps.
///
/// Input: the mission ID. Output: the folder's path.
#[tauri::command]
pub async fn reset_practice_repo<R: Runtime>(
    app: AppHandle<R>,
    mission_id: String,
) -> Result<String, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .reset(&mission_id)
        .map_err(|error| error.to_string())?;
    Ok(folder.path().display().to_string())
}
