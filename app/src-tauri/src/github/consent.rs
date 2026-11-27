//! The student's consent to practise on GitHub, kept by Rust (security audit M1).
//!
//! The screens can ask for consent, but they cannot grant it: only a native dialog shown by
//! Rust does (`commands/github.rs`). The answer is a small file in the app's data folder, so
//! a script running in the web view can never claim a consent the student did not give.

use std::fs;
use std::path::{Path, PathBuf};

/// The file that holds the consent, inside the app's local data folder.
const CONSENT_FILE_NAME: &str = "github-consent.txt";

/// What the file says when the student agreed.
const AGREED_TEXT: &str = "agreed";

/// Where the consent file lives.
///
/// Input: the app's local data folder. Output: the file's path.
fn consent_path(data_folder: &Path) -> PathBuf {
    data_folder.join(CONSENT_FILE_NAME)
}

/// Tells whether the student agreed to practise on GitHub.
///
/// Input: the app's local data folder. Output: true once they agreed (and did not take it back).
pub fn has_consent(data_folder: &Path) -> bool {
    fs::read_to_string(consent_path(data_folder))
        .map(|text| text.trim() == AGREED_TEXT)
        .unwrap_or(false)
}

/// Saves the student's yes. Only call it after Rust's own dialog got that yes.
///
/// Input: the app's local data folder. Output: nothing, or a readable error.
pub fn save_consent(data_folder: &Path) -> Result<(), String> {
    fs::create_dir_all(data_folder).map_err(|error| error.to_string())?;
    fs::write(consent_path(data_folder), AGREED_TEXT).map_err(|error| error.to_string())
}

/// Takes the consent back.
///
/// Input: the app's local data folder. Output: nothing, or a readable error.
pub fn remove_consent(data_folder: &Path) -> Result<(), String> {
    match fs::remove_file(consent_path(data_folder)) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error.to_string()),
    }
}

/// The words of the consent dialog: exactly what the app will do on the student's account.
///
/// Inputs: none. Output: the dialog's text.
pub fn consent_dialog_text() -> &'static str {
    "GitHub challenges practise on your own GitHub account, through your own gh login. The app stores no token.\n\n\
If you allow it, the app will:\n\
- create public repositories named gitremastered-practice-… on your account;\n\
- push practice commits to them, and on each start or reset replace everything in them with the challenge's starting state;\n\
- open, comment on and merge practice pull requests and issues there, as \"a teammate\", from your own account;\n\
- on each start or reset, close open pull requests and issues and delete releases and rules in those repositories only.\n\n\
It never touches any other repository and never changes your account settings, keys or organizations. You can delete the practice repositories and take this back in Settings, GitHub."
}

#[cfg(test)]
mod tests {
    use super::*;

    /// No file means no consent; saving gives it; removing takes it back.
    #[test]
    fn consent_lives_in_a_file_rust_writes() {
        let folder = tempfile::tempdir().expect("temporary folder");
        assert!(!has_consent(folder.path()));

        save_consent(folder.path()).expect("save");
        assert!(has_consent(folder.path()));

        remove_consent(folder.path()).expect("remove");
        assert!(!has_consent(folder.path()));
        remove_consent(folder.path()).expect("removing twice is fine");
    }

    /// A file with other text is not a consent.
    #[test]
    fn only_the_exact_answer_counts() {
        let folder = tempfile::tempdir().expect("temporary folder");
        fs::write(folder.path().join(CONSENT_FILE_NAME), "maybe").expect("write");
        assert!(!has_consent(folder.path()));
    }
}
