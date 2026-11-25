//! `get_git_version`: asks the student's installed Git for its version.
//!
//! Shown on the Settings page, and the first end-to-end check that the screens
//! can call the Rust core.

use std::process::Command;

/// Runs `git --version` and returns the version number, like `2.55.0.windows.1`.
///
/// Inputs: none. Output: the version, or a readable error if Git is missing or answers oddly.
/// This touches no repository: `--version` only prints Git's own version.
#[tauri::command]
pub async fn get_git_version() -> Result<String, String> {
    let output = build_git_command()
        .arg("--version")
        .output()
        .map_err(|error| format!("Could not run Git. Is it installed? ({error})"))?;

    let output_text = String::from_utf8_lossy(&output.stdout);
    parse_git_version(&output_text)
        .ok_or_else(|| format!("Git answered something unexpected: {}", output_text.trim()))
}

/// Builds a `git` command that never opens a console window.
///
/// Inputs: none. Output: the command, ready for arguments.
fn build_git_command() -> Command {
    #[allow(unused_mut)] // `mut` is only needed on Windows.
    let mut git_command = Command::new("git");

    // On Windows, a desktop app that starts a console program flashes a black window.
    // The CREATE_NO_WINDOW flag (0x08000000) stops that.
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        git_command.creation_flags(CREATE_NO_WINDOW);
    }

    git_command
}

/// Reads the version number out of `git --version`'s output.
///
/// Input: the output text, like `git version 2.55.0.windows.1\n`.
/// Output: `Some("2.55.0.windows.1")`, or `None` if the text is not Git's version line.
pub fn parse_git_version(output_text: &str) -> Option<String> {
    let version_number = output_text.trim().strip_prefix("git version ")?;
    if version_number.is_empty() {
        return None;
    }
    Some(version_number.to_string())
}

#[cfg(test)]
mod tests {
    use super::parse_git_version;

    /// Git for Windows adds ".windows.N" to the number; it is kept as is.
    #[test]
    fn reads_the_windows_version_line() {
        let version = parse_git_version("git version 2.55.0.windows.1\n");
        assert_eq!(version.as_deref(), Some("2.55.0.windows.1"));
    }

    /// Linux prints a plain number; macOS adds "(Apple Git-…)".
    #[test]
    fn reads_the_plain_and_apple_version_lines() {
        let plain_version = parse_git_version("git version 2.55.0");
        let apple_version = parse_git_version("git version 2.50.1 (Apple Git-155)");
        assert_eq!(plain_version.as_deref(), Some("2.55.0"));
        assert_eq!(apple_version.as_deref(), Some("2.50.1 (Apple Git-155)"));
    }

    /// Runs the real command against the Git installed on this computer (and on CI).
    #[test]
    fn asks_the_installed_git_for_its_version() {
        let version = tauri::async_runtime::block_on(super::get_git_version())
            .expect("Git is installed on every machine that runs these tests");
        let starts_with_digit = version
            .chars()
            .next()
            .is_some_and(|first| first.is_ascii_digit());
        assert!(starts_with_digit, "unexpected version text: {version}");
    }

    /// Anything that is not Git's version line is rejected.
    #[test]
    fn rejects_other_text() {
        assert_eq!(parse_git_version(""), None);
        assert_eq!(parse_git_version("git version "), None);
        assert_eq!(parse_git_version("bash: git: command not found"), None);
    }
}
