//! Practice folders (docs/SPEC.md section 3.6). Each lesson gets a small workspace, rebuilt for each challenge:
//!
//! ```text
//! <app data>/practice/<practiceId>/            the workspace, deleted and rebuilt as a whole
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
    /// The practice ID has characters that could escape the folder (like `..` or `/`).
    InvalidPracticeId(String),
    /// A path from the screens is not inside the practice root.
    OutsidePracticeRoot(PathBuf),
    /// Reset was asked for a practice folder that was never created.
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
            Self::InvalidPracticeId(practice_id) => write!(
                formatter,
                "\"{practice_id}\" is not a valid practice ID (use a-z, 0-9 and -)"
            ),
            Self::OutsidePracticeRoot(path) => write!(
                formatter,
                "{} is outside the practice folders, so the app will not run commands there",
                path.display()
            ),
            Self::NoSavedSetup(practice_id) => write!(
                formatter,
                "The practice folder for \"{practice_id}\" was never created, so it cannot be reset"
            ),
            Self::StepFailed { step, output } => {
                write!(formatter, "The setup step \"{step}\" failed: {output}")
            }
            Self::FileSystem(message) => write!(formatter, "File system error: {message}"),
        }
    }
}

/// The name of the practice folder inside a lesson's workspace.
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

    /// Gives a lesson's practice folder (`<root>/<practiceId>/project`), without
    /// creating it.
    ///
    /// Input: the practice ID, e.g. `three-areas`. Output: the folder, or an error for a bad ID.
    pub fn folder_for(&self, practice_id: &str) -> Result<PracticeFolder, PracticeError> {
        if !is_valid_practice_id(practice_id) {
            return Err(PracticeError::InvalidPracticeId(practice_id.to_string()));
        }
        Ok(PracticeFolder {
            path: self.workspace_path(practice_id).join(PROJECT_FOLDER_NAME),
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
    /// Inputs: the practice ID and its setup steps. Output: the new folder, or the first error.
    pub fn create(
        &self,
        practice_id: &str,
        setup_steps: &[String],
    ) -> Result<PracticeFolder, PracticeError> {
        self.create_with_environment(practice_id, setup_steps, &[])
    }

    /// Like `create`, with extra environment variables for the setup steps (a GitHub
    /// challenge's steps reach the practice repository through `PRACTICE_GITHUB_URL`).
    ///
    /// Inputs: the practice ID, its setup steps and the variables. Output: the new folder.
    pub fn create_with_environment(
        &self,
        practice_id: &str,
        setup_steps: &[String],
        environment: &[(String, String)],
    ) -> Result<PracticeFolder, PracticeError> {
        let folder = self.folder_for(practice_id)?;
        let saved_steps = serde_json::to_string(setup_steps)
            .map_err(|error| PracticeError::FileSystem(error.to_string()))?;
        fs::write(self.saved_setup_path(practice_id), saved_steps).map_err(file_system_error)?;
        self.rebuild(practice_id, &folder, setup_steps, environment)?;
        Ok(folder)
    }

    /// Tells whether the lesson's folder is built and was built from these setup steps, so
    /// `open_or_create` would keep it as the student left it.
    ///
    /// Inputs: the practice ID and its setup steps. Output: true if it would be kept.
    pub fn is_built_with(
        &self,
        practice_id: &str,
        setup_steps: &[String],
    ) -> Result<bool, PracticeError> {
        let is_built = self.find(practice_id)?.is_some();
        Ok(is_built && self.read_saved_steps(practice_id).as_deref() == Some(setup_steps))
    }

    /// Opens a lesson's practice folder as the student left it, or builds it if there is none.
    /// It is built again when the challenge's setup steps changed since it was built (for
    /// example after a course update), because the old folder no longer fits the active challenge.
    ///
    /// Inputs: the practice ID and its setup steps. Output: the folder, or the first error.
    pub fn open_or_create(
        &self,
        practice_id: &str,
        setup_steps: &[String],
    ) -> Result<PracticeFolder, PracticeError> {
        let existing_folder = self.find(practice_id)?;
        let saved_steps = self.read_saved_steps(practice_id);
        match existing_folder {
            Some(folder) if saved_steps.as_deref() == Some(setup_steps) => Ok(folder),
            _ => self.create(practice_id, setup_steps),
        }
    }

    /// Finds a lesson's practice folder without creating it: only a folder whose setup ran
    /// to the end counts (a half-built folder does not). It need not hold a Git repository:
    /// in a lesson about `git init`, creating the repository is the student's job.
    ///
    /// Input: the practice ID. Output: the folder, `None` if it was never built, or an error
    /// for a bad ID.
    pub fn find(&self, practice_id: &str) -> Result<Option<PracticeFolder>, PracticeError> {
        let folder = self.folder_for(practice_id)?;
        let is_fully_built = self.ready_marker_path(practice_id).is_file();
        if folder.path().is_dir() && is_fully_built {
            Ok(Some(folder))
        } else {
            Ok(None)
        }
    }

    /// Deletes a lesson's practice folder and builds it again from its saved setup steps.
    ///
    /// Input: the practice ID. Output: the rebuilt folder, or an error if it was never created.
    pub fn reset(&self, practice_id: &str) -> Result<PracticeFolder, PracticeError> {
        self.reset_with_environment(practice_id, &[])
    }

    /// Like `reset`, with extra environment variables for the setup steps.
    ///
    /// Inputs: the practice ID and the variables. Output: the rebuilt folder.
    pub fn reset_with_environment(
        &self,
        practice_id: &str,
        environment: &[(String, String)],
    ) -> Result<PracticeFolder, PracticeError> {
        let folder = self.folder_for(practice_id)?;
        let setup_steps = self
            .read_saved_steps(practice_id)
            .ok_or_else(|| PracticeError::NoSavedSetup(practice_id.to_string()))?;
        self.rebuild(practice_id, &folder, &setup_steps, environment)?;
        Ok(folder)
    }

    /// Reads the setup steps saved when the folder was last built.
    ///
    /// Input: a practice ID that was already checked. Output: the steps, or `None` if there are
    /// none or the saved file is unreadable.
    fn read_saved_steps(&self, practice_id: &str) -> Option<Vec<String>> {
        let saved_text = fs::read_to_string(self.saved_setup_path(practice_id)).ok()?;
        serde_json::from_str(&saved_text).ok()
    }

    /// Deletes the lesson's whole workspace if it exists, creates an empty practice folder,
    /// and runs the steps inside it. The "ready" marker is written last, so a build that
    /// stopped halfway is never mistaken for a finished one.
    ///
    /// Inputs: a practice ID that was already checked, its folder, the steps and their extra
    /// environment variables. Output: nothing, or the first error.
    fn rebuild(
        &self,
        practice_id: &str,
        folder: &PracticeFolder,
        setup_steps: &[String],
        environment: &[(String, String)],
    ) -> Result<(), PracticeError> {
        let ready_marker_path = self.ready_marker_path(practice_id);
        if ready_marker_path.exists() {
            fs::remove_file(&ready_marker_path).map_err(file_system_error)?;
        }
        remove_folder_with_retries(&self.workspace_path(practice_id))?;
        fs::create_dir_all(folder.path()).map_err(file_system_error)?;
        run_setup_steps(folder, setup_steps, environment)?;
        fs::write(ready_marker_path, "").map_err(file_system_error)
    }

    /// Marks a lesson's folder as not finished, so the next open builds it again. Used when
    /// a GitHub challenge's steps after the local setup failed (code review finding 2).
    ///
    /// Input: the practice ID. Output: nothing, or an error.
    pub fn mark_not_ready(&self, practice_id: &str) -> Result<(), PracticeError> {
        self.folder_for(practice_id)?;
        let ready_marker_path = self.ready_marker_path(practice_id);
        if ready_marker_path.exists() {
            fs::remove_file(ready_marker_path).map_err(file_system_error)?;
        }
        Ok(())
    }

    /// Saves when a GitHub challenge's attempt started (GitHub's clock), next to the folder.
    ///
    /// Inputs: the practice ID and the time (ISO 8601). Output: nothing, or an error.
    pub fn save_github_start(
        &self,
        practice_id: &str,
        started_at: &str,
    ) -> Result<(), PracticeError> {
        self.folder_for(practice_id)?;
        fs::write(self.github_start_path(practice_id), started_at).map_err(file_system_error)
    }

    /// Reads when a GitHub challenge's attempt started.
    ///
    /// Input: the practice ID. Output: the time, or `None` if no GitHub attempt was built.
    pub fn read_github_start(&self, practice_id: &str) -> Result<Option<String>, PracticeError> {
        self.folder_for(practice_id)?;
        let saved = fs::read_to_string(self.github_start_path(practice_id)).ok();
        Ok(saved.map(|text| text.trim().to_string()))
    }

    /// Where a GitHub challenge's start time is saved: `<root>/<practiceId>.github-start`.
    ///
    /// Input: a practice ID that was already checked. Output: the file path.
    fn github_start_path(&self, practice_id: &str) -> PathBuf {
        self.root_path.join(format!("{practice_id}.github-start"))
    }

    /// A lesson's workspace: the folder that holds its practice folder and, in remote
    /// lessons, the repositories beside it.
    ///
    /// Input: a practice ID that was already checked. Output: `<root>/<practiceId>`.
    fn workspace_path(&self, practice_id: &str) -> PathBuf {
        self.root_path.join(practice_id)
    }

    /// The empty file that says "this folder's setup ran to the end":
    /// `<root>/<practiceId>.ready`, outside the workspace like the saved steps.
    ///
    /// Input: a practice ID that was already checked. Output: the file path.
    fn ready_marker_path(&self, practice_id: &str) -> PathBuf {
        self.root_path.join(format!("{practice_id}.ready"))
    }

    /// Where the active challenge's setup steps are saved: `<root>/<practiceId>.setup.json`, outside the
    /// practice folder so they never show up in `git status`.
    ///
    /// Input: a practice ID that was already checked. Output: the file path.
    fn saved_setup_path(&self, practice_id: &str) -> PathBuf {
        self.root_path.join(format!("{practice_id}.setup.json"))
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

/// Checks a practice ID: lowercase letters, digits and hyphens only, not empty.
///
/// Input: the ID. Output: true if it is safe to use as a folder name.
pub fn is_valid_practice_id(practice_id: &str) -> bool {
    !practice_id.is_empty()
        && practice_id.chars().all(|character| {
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
    use super::is_valid_practice_id;

    /// IDs that are plain folder names are accepted.
    #[test]
    fn accepts_simple_practice_ids() {
        assert!(is_valid_practice_id("three-areas"));
        assert!(is_valid_practice_id("lesson-2"));
    }

    /// IDs that could reach another folder are refused.
    #[test]
    fn refuses_ids_that_could_escape() {
        for bad_id in ["", "..", "../other", "a/b", r"a\b", "Three", "x y"] {
            assert!(
                !is_valid_practice_id(bad_id),
                "{bad_id:?} should be refused"
            );
        }
    }
}
