//! Finds the shell that runs challenge steps and the student's terminal.
//!
//! Windows: Git Bash, which ships with Git for Windows. We ask Git where it lives
//! (`git --exec-path`, e.g. `C:/Program Files/Git/mingw64/libexec/git-core`) and walk up
//! until a folder holds `bin/bash.exe`. macOS and Linux: `bash` from the PATH.

use std::path::{Path, PathBuf};

use super::hidden_command::hidden_command;

/// Finds the bash program.
///
/// Inputs: none. Output: the program path (or name on macOS and Linux), or a readable error.
pub fn find_bash_program() -> Result<PathBuf, String> {
    if cfg!(windows) {
        find_git_bash()
    } else {
        Ok(PathBuf::from("bash"))
    }
}

/// How to start the student's interactive shell.
#[derive(Debug, Clone, PartialEq)]
pub struct ShellLaunch {
    /// The program to run, e.g. the path of `bash.exe` or `/bin/zsh`.
    pub program: PathBuf,
    /// Its arguments: a login, interactive shell.
    pub arguments: Vec<String>,
    /// Extra environment variables for the shell.
    pub environment: Vec<(String, String)>,
    /// Variables the app inherited that must not reach the shell.
    pub removed_environment: Vec<String>,
}

/// What Git Bash runs before it draws each prompt (bash's `PROMPT_COMMAND`): it sets the
/// prompt to one short line, like `three-areas (main) $`.
///
/// Why: Git Bash's own prompt is two lines with the full practice path. After Ctrl C or a
/// resize, redrawing it lost the first typed key or stalled the output (pilot review,
/// finding 4). Setting it here, and not in a start file, keeps the student's own Git Bash
/// settings (aliases, colors, PATH) loading as usual.
///
/// The parts: `\W` is the current folder's name; `__git_ps1` is Git's own helper that prints
/// the branch (or the commit, when HEAD is detached); `\[\e[36m\]` colors it cyan.
const SHORT_PROMPT_COMMAND: &str =
    r#"PS1='\W\[\e[36m\]$(__git_ps1 " (%s)" 2>/dev/null)\[\e[0m\] \$ '"#;

/// Chooses the shell for the terminal: Git Bash on Windows, the user's own shell elsewhere.
///
/// Inputs: none. Output: how to start the shell, or a readable error.
pub fn terminal_shell() -> Result<ShellLaunch, String> {
    let mut environment = vec![
        // Lets programs know they can use colors.
        ("TERM".to_string(), "xterm-256color".to_string()),
        // Git Bash's login script moves to the home folder unless this is set.
        ("CHERE_INVOKING".to_string(), "1".to_string()),
    ];
    if cfg!(windows) {
        environment.push(("MSYSTEM".to_string(), "MINGW64".to_string()));
        environment.push((
            "PROMPT_COMMAND".to_string(),
            SHORT_PROMPT_COMMAND.to_string(),
        ));
        return Ok(ShellLaunch {
            program: find_git_bash()?,
            arguments: vec!["--login".to_string(), "-i".to_string()],
            environment,
            removed_environment: inherited_variables_to_remove(),
        });
    }
    let user_shell = std::env::var("SHELL").unwrap_or_else(|_| "bash".to_string());
    Ok(ShellLaunch {
        program: PathBuf::from(user_shell),
        arguments: vec!["-l".to_string(), "-i".to_string()],
        environment,
        removed_environment: inherited_variables_to_remove(),
    })
}

/// Lists inherited variables that would change what the student sees in the terminal.
///
/// Tools that launch programs (code editors, AI assistants, build scripts) often set
/// `GIT_EDITOR=true` so Git never waits for an editor. If the app was started by such a
/// tool, the student's `git commit` without `-m` would quietly abort instead of opening an
/// editor, unlike a real terminal. A real editor choice (`code --wait`, `nano`) is kept.
///
/// Input: none (reads the app's own environment). Output: the variable names to remove.
fn inherited_variables_to_remove() -> Vec<String> {
    let inherited_editor = std::env::var("GIT_EDITOR").unwrap_or_default();
    if is_do_nothing_editor(&inherited_editor) {
        vec!["GIT_EDITOR".to_string()]
    } else {
        Vec::new()
    }
}

/// Tells whether an editor command does nothing, so Git would get an empty message.
///
/// Input: the editor command. Output: true for `true` and `:` (shell commands that do nothing).
fn is_do_nothing_editor(editor_command: &str) -> bool {
    let command = editor_command.trim();
    command == "true" || command == ":"
}

/// Finds Git Bash next to the installed Git for Windows.
///
/// Inputs: none. Output: the path of `bash.exe`, or an error saying Git Bash is missing.
fn find_git_bash() -> Result<PathBuf, String> {
    let output = hidden_command("git")
        .arg("--exec-path")
        .output()
        .map_err(|error| format!("Could not run Git to find Git Bash ({error})"))?;
    let exec_path_text = String::from_utf8_lossy(&output.stdout);
    let exec_path = PathBuf::from(exec_path_text.trim());
    find_bash_above(&exec_path).ok_or_else(|| {
        format!(
            "Git Bash was not found near {}. Reinstall Git for Windows with Git Bash.",
            exec_path.display()
        )
    })
}

/// Walks up from a folder until one of its parents holds `bin/bash.exe`.
///
/// Input: a folder inside the Git installation.
/// Output: the full path of `bash.exe`, or `None` if no parent holds it.
pub fn find_bash_above(start_folder: &Path) -> Option<PathBuf> {
    start_folder
        .ancestors()
        .map(|folder| folder.join("bin").join("bash.exe"))
        .find(|candidate| candidate.is_file())
}

#[cfg(test)]
mod tests {
    use super::{find_bash_above, is_do_nothing_editor};
    use std::fs;

    /// A fake Git layout: Git/mingw64/libexec/git-core, with Git/bin/bash.exe.
    #[test]
    fn finds_bash_in_a_parent_folder() {
        let git_folder = tempfile::tempdir().expect("temporary folder");
        let exec_path = git_folder.path().join("mingw64/libexec/git-core");
        fs::create_dir_all(&exec_path).expect("create fake exec path");
        fs::create_dir_all(git_folder.path().join("bin")).expect("create bin");
        fs::write(git_folder.path().join("bin/bash.exe"), "").expect("create fake bash");

        let found = find_bash_above(&exec_path).expect("bash is found");
        assert_eq!(found, git_folder.path().join("bin").join("bash.exe"));
    }

    /// No bash anywhere above: nothing is found.
    #[test]
    fn finds_nothing_without_bash() {
        let empty_folder = tempfile::tempdir().expect("temporary folder");
        assert_eq!(find_bash_above(empty_folder.path()), None);
    }

    /// `true` and `:` do nothing; a real editor command is kept.
    #[test]
    fn spots_editors_that_do_nothing() {
        assert!(is_do_nothing_editor("true"));
        assert!(is_do_nothing_editor(" : "));
        assert!(!is_do_nothing_editor("code --wait"));
        assert!(!is_do_nothing_editor(""));
    }
}
