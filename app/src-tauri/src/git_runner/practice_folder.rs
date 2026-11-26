//! Practice folders (SPEC.md section 3.6). Each mission gets a small workspace:
//!
//! ```text
//! <app data>/practice/<missionId>/            the workspace, deleted and rebuilt as a whole
//!                        ├── project/        the practice folder: the terminal opens here
//!                        ├── origin.git/     only in remote lessons: a local "server"
//!                        └── teammate/       only in remote lessons: someone else's clone
//! ```
//!
//! Setup steps run inside `project/`, so a lesson about remotes can build its own "server"
//! right beside it (`git init --bare ../origin.git`) and everything works offline. Because
//! the whole workspace is rebuilt on reset, nothing is ever left behind.
//!
//! Safety rule: the app's own commands run only inside a practice folder. The type system
//! enforces it: code that runs commands takes a `PracticeFolder`, and the only way to get
//! one is through `PracticeRoot`, which checks the path first.

use std::fmt;
use std::fs;
use std::path::{Path, PathBuf};

use super::setup_steps::run_setup_steps;

/// Everything that can go wrong with practice folders, in words a student can read.
#[derive(Debug, PartialEq)]
pub enum PracticeError {
    /// The mission ID has characters that could escape the folder (like `..` or `/`).
    InvalidMissionId(String),
    /// A path from the screens is not inside the practice root.
    OutsidePracticeRoot(PathBuf),
    /// Reset was asked for a mission that was never created.
    NoSavedSetup(String),
    /// A setup step exited with an error.
    StepFailed { step: String, output: String },
    /// The file system refused (no space, no permission...).
    FileSystem(String),
}

impl fmt::Display for PracticeError {
    /// Writes the error as one readable sentence.
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::InvalidMissionId(mission_id) => write!(
                formatter,
                "\"{mission_id}\" is not a valid mission ID (use a-z, 0-9 and -)"
            ),
            Self::OutsidePracticeRoot(path) => write!(
                formatter,
                "{} is outside the practice folders, so the app will not run commands there",
                path.display()
            ),
            Self::NoSavedSetup(mission_id) => write!(
                formatter,
                "The practice folder for \"{mission_id}\" was never created, so it cannot be reset"
            ),
            Self::StepFailed { step, output } => {
                write!(formatter, "The setup step \"{step}\" failed: {output}")
            }
            Self::FileSystem(message) => write!(formatter, "File system error: {message}"),
        }
    }
}

/// The name of the practice folder inside a mission's workspace.
const PROJECT_FOLDER_NAME: &str = "project";

/// A folder that is known to be inside the practice root. Only `PracticeRoot` makes these.
#[derive(Debug, Clone, PartialEq)]
pub struct PracticeFolder {
    path: PathBuf,
}

impl PracticeFolder {
    /// The folder's path. Input: none. Output: the path.
    pub fn path(&self) -> &Path {
        &self.path
    }
}

/// The folder that holds every practice folder, e.g. `<app data>/practice/`.
pub struct PracticeRoot {
    root_path: PathBuf,
}

impl PracticeRoot {
    /// Opens (and creates, if needed) the practice root.
    ///
    /// Input: the root folder's path. Output: the root, or a file system error.
    pub fn open(root_path: PathBuf) -> Result<Self, PracticeError> {
        fs::create_dir_all(&root_path).map_err(file_system_error)?;
        let canonical_root = canonical_path(&root_path)?;
        Ok(Self {
            root_path: canonical_root,
        })
    }

    /// Gives the practice folder for a mission (`<root>/<missionId>/project`), without
    /// creating it.
    ///
    /// Input: the mission ID, e.g. `three-areas`. Output: the folder, or an error for a bad ID.
    pub fn folder_for(&self, mission_id: &str) -> Result<PracticeFolder, PracticeError> {
        if !is_valid_mission_id(mission_id) {
            return Err(PracticeError::InvalidMissionId(mission_id.to_string()));
        }
        Ok(PracticeFolder {
            path: self.workspace_path(mission_id).join(PROJECT_FOLDER_NAME),
        })
    }

    /// Checks that a path from the screens is an existing folder inside the practice root.
    ///
    /// Input: any path. Output: the folder, or `OutsidePracticeRoot`.
    pub fn check_inside(&self, path: &Path) -> Result<PracticeFolder, PracticeError> {
        let outside = || PracticeError::OutsidePracticeRoot(path.to_path_buf());
        let canonical = canonical_path(path).map_err(|_| outside())?;
        let is_strictly_inside =
            canonical.starts_with(&self.root_path) && canonical != self.root_path;
        if !is_strictly_inside {
            return Err(outside());
        }
        Ok(PracticeFolder { path: canonical })
    }

    /// Builds a fresh practice folder: deletes any old one, then runs the setup steps.
    /// The steps are saved beside the folder so `reset` can run them again later.
    ///
    /// Inputs: the mission ID and its setup steps. Output: the new folder, or the first error.
    pub fn create(
        &self,
        mission_id: &str,
        setup_steps: &[String],
    ) -> Result<PracticeFolder, PracticeError> {
        let folder = self.folder_for(mission_id)?;
        let saved_steps = serde_json::to_string(setup_steps)
            .map_err(|error| PracticeError::FileSystem(error.to_string()))?;
        fs::write(self.saved_setup_path(mission_id), saved_steps).map_err(file_system_error)?;
        self.rebuild(mission_id, &folder, setup_steps)?;
        Ok(folder)
    }

    /// Opens a mission's practice folder as the student left it, or builds it if there is none.
    /// It is built again when the mission's setup steps changed since it was built (for
    /// example after a course update), because the old folder no longer fits the mission.
    ///
    /// Inputs: the mission ID and its setup steps. Output: the folder, or the first error.
    pub fn open_or_create(
        &self,
        mission_id: &str,
        setup_steps: &[String],
    ) -> Result<PracticeFolder, PracticeError> {
        let existing_folder = self.find(mission_id)?;
        let saved_steps = self.read_saved_steps(mission_id);
        match existing_folder {
            Some(folder) if saved_steps.as_deref() == Some(setup_steps) => Ok(folder),
            _ => self.create(mission_id, setup_steps),
        }
    }

    /// Finds a mission's practice folder without creating it: only a folder whose setup ran
    /// to the end counts (a half-built folder does not). It need not hold a Git repository:
    /// in a lesson about `git init`, creating the repository is the student's job.
    ///
    /// Input: the mission ID. Output: the folder, `None` if it was never built, or an error
    /// for a bad ID.
    pub fn find(&self, mission_id: &str) -> Result<Option<PracticeFolder>, PracticeError> {
        let folder = self.folder_for(mission_id)?;
        let is_fully_built = self.ready_marker_path(mission_id).is_file();
        if folder.path().is_dir() && is_fully_built {
            Ok(Some(folder))
        } else {
            Ok(None)
        }
    }

    /// Deletes a mission's practice folder and builds it again from its saved setup steps.
    ///
    /// Input: the mission ID. Output: the rebuilt folder, or an error if it was never created.
    pub fn reset(&self, mission_id: &str) -> Result<PracticeFolder, PracticeError> {
        let folder = self.folder_for(mission_id)?;
        let setup_steps = self
            .read_saved_steps(mission_id)
            .ok_or_else(|| PracticeError::NoSavedSetup(mission_id.to_string()))?;
        self.rebuild(mission_id, &folder, &setup_steps)?;
        Ok(folder)
    }

    /// Reads the setup steps saved when the folder was last built.
    ///
    /// Input: a mission ID that was already checked. Output: the steps, or `None` if there are
    /// none or the saved file is unreadable.
    fn read_saved_steps(&self, mission_id: &str) -> Option<Vec<String>> {
        let saved_text = fs::read_to_string(self.saved_setup_path(mission_id)).ok()?;
        serde_json::from_str(&saved_text).ok()
    }

    /// Deletes the mission's whole workspace if it exists, creates an empty practice folder,
    /// and runs the steps inside it. The "ready" marker is written last, so a build that
    /// stopped halfway is never mistaken for a finished one.
    ///
    /// Inputs: a mission ID that was already checked, its folder and the steps.
    /// Output: nothing, or the first error.
    fn rebuild(
        &self,
        mission_id: &str,
        folder: &PracticeFolder,
        setup_steps: &[String],
    ) -> Result<(), PracticeError> {
        let ready_marker_path = self.ready_marker_path(mission_id);
        if ready_marker_path.exists() {
            fs::remove_file(&ready_marker_path).map_err(file_system_error)?;
        }
        remove_folder_with_retries(&self.workspace_path(mission_id))?;
        fs::create_dir_all(folder.path()).map_err(file_system_error)?;
        run_setup_steps(folder, setup_steps)?;
        fs::write(ready_marker_path, "").map_err(file_system_error)
    }

    /// A mission's workspace: the folder that holds its practice folder and, in remote
    /// lessons, the repositories beside it.
    ///
    /// Input: a mission ID that was already checked. Output: `<root>/<missionId>`.
    fn workspace_path(&self, mission_id: &str) -> PathBuf {
        self.root_path.join(mission_id)
    }

    /// The empty file that says "this mission's setup ran to the end":
    /// `<root>/<missionId>.ready`, outside the workspace like the saved steps.
    ///
    /// Input: a mission ID that was already checked. Output: the file path.
    fn ready_marker_path(&self, mission_id: &str) -> PathBuf {
        self.root_path.join(format!("{mission_id}.ready"))
    }

    /// Where a mission's setup steps are saved: `<root>/<missionId>.setup.json`, outside the
    /// practice folder so they never show up in `git status`.
    ///
    /// Input: a mission ID that was already checked. Output: the file path.
    fn saved_setup_path(&self, mission_id: &str) -> PathBuf {
        self.root_path.join(format!("{mission_id}.setup.json"))
    }
}

/// Deletes a folder and everything in it, if it exists. On Windows a folder stays locked for
/// a moment after a program inside it stops, so a failed delete is tried again a few times.
///
/// Input: the folder. Output: nothing, or the last error.
fn remove_folder_with_retries(folder_path: &Path) -> Result<(), PracticeError> {
    const ATTEMPTS: u32 = 10;
    const PAUSE: std::time::Duration = std::time::Duration::from_millis(100);
    for attempt in 1..=ATTEMPTS {
        if !folder_path.exists() {
            return Ok(());
        }
        match fs::remove_dir_all(folder_path) {
            Ok(()) => return Ok(()),
            Err(error) if attempt == ATTEMPTS => return Err(file_system_error(error)),
            Err(_) => std::thread::sleep(PAUSE),
        }
    }
    Ok(())
}

/// Checks a mission ID: lowercase letters, digits and hyphens only, not empty.
///
/// Input: the ID. Output: true if it is safe to use as a folder name.
pub fn is_valid_mission_id(mission_id: &str) -> bool {
    !mission_id.is_empty()
        && mission_id.chars().all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
        })
}

/// Resolves a path to its real, absolute form (no `..`, no links), for safe comparisons.
/// On Windows it also drops the `\\?\` prefix that `canonicalize` adds, which other
/// programs (like bash) do not understand.
///
/// Input: an existing path. Output: the canonical path, or a file system error.
fn canonical_path(path: &Path) -> Result<PathBuf, PracticeError> {
    let canonical = fs::canonicalize(path).map_err(file_system_error)?;
    let canonical_text = canonical.to_string_lossy();
    match canonical_text.strip_prefix(r"\\?\") {
        Some(plain) if !plain.starts_with("UNC\\") => Ok(PathBuf::from(plain)),
        _ => Ok(canonical),
    }
}

/// Turns an input/output error into a `PracticeError`.
///
/// Input: the error. Output: the matching `PracticeError::FileSystem`.
fn file_system_error(error: std::io::Error) -> PracticeError {
    PracticeError::FileSystem(error.to_string())
}

#[cfg(test)]
mod tests {
    use super::is_valid_mission_id;

    /// IDs that are plain folder names are accepted.
    #[test]
    fn accepts_simple_mission_ids() {
        assert!(is_valid_mission_id("three-areas"));
        assert!(is_valid_mission_id("lesson-2"));
    }

    /// IDs that could reach another folder are refused.
    #[test]
    fn refuses_ids_that_could_escape() {
        for bad_id in ["", "..", "../other", "a/b", r"a\b", "Three", "x y"] {
            assert!(!is_valid_mission_id(bad_id), "{bad_id:?} should be refused");
        }
    }
}
