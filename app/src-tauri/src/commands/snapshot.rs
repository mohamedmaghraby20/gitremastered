//! `get_repo_snapshot`: reads the current state of a practice repository.

use tauri::{AppHandle, Runtime};

use super::practice::open_practice_root;
use crate::models::repo_snapshot::RepoSnapshot;
use crate::repo_inspector::snapshot::read_snapshot;

/// Reads the state of the repository in a practice folder.
///
/// Input: the practice folder's path (must be inside the practice root).
/// Output: the snapshot, or a readable error.
#[tauri::command]
pub async fn get_repo_snapshot<R: Runtime>(
    app: AppHandle<R>,
    practice_folder_path: String,
) -> Result<RepoSnapshot, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .check_inside(std::path::Path::new(&practice_folder_path))
        .map_err(|error| error.to_string())?;
    read_snapshot(&folder)
}
