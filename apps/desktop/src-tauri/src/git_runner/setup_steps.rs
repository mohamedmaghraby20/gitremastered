//! Runs a mission's setup steps (shell commands from mission.yaml) inside a practice folder.
//!
//! Each step runs as `bash -c "<step>"`, so steps can use shell features like `>` and `||`.
//! The function takes a `PracticeFolder`, so it can never run outside a practice folder.

use super::hidden_command::hidden_command;
use super::practice_folder::{PracticeError, PracticeFolder};
use super::shell_choice::find_bash_program;
use crate::github::gh_command::redact_tokens;

/// Runs each setup step in order, stopping at the first one that fails.
///
/// Inputs: the practice folder, the steps, and extra environment variables (a GitHub
/// challenge gets `PRACTICE_GITHUB_URL`). Output: nothing, or the failed step and its output.
pub fn run_setup_steps(
    folder: &PracticeFolder,
    setup_steps: &[String],
    environment: &[(String, String)],
) -> Result<(), PracticeError> {
    if setup_steps.is_empty() {
        return Ok(());
    }
    let bash_program = find_bash_program().map_err(PracticeError::FileSystem)?;
    for step in setup_steps {
        let output = hidden_command(&bash_program)
            .arg("-c")
            .arg(step)
            .current_dir(folder.path())
            // Never wait for a password or an editor while setting up.
            .env("GIT_TERMINAL_PROMPT", "0")
            .env("GIT_EDITOR", "true")
            // Never open a sign-in window of the Git Credential Manager while setting up.
            .env("GCM_INTERACTIVE", "never")
            // A token in the environment would let a setup line reach GitHub around the guard
            // (security audit M2): setup lines reach GitHub only through git and the student's
            // own credential helper, with the URL Rust gives them.
            .env_remove("GH_TOKEN")
            .env_remove("GITHUB_TOKEN")
            .env_remove("GH_ENTERPRISE_TOKEN")
            .envs(environment.iter().map(|(name, value)| (name, value)))
            .output()
            .map_err(|error| PracticeError::StepFailed {
                step: step.clone(),
                output: error.to_string(),
            })?;
        if !output.status.success() {
            let error_output = String::from_utf8_lossy(&output.stderr);
            // A push or clone error could hold a token; never show one (security audit L4).
            let error_text = redact_tokens(error_output.trim());
            return Err(PracticeError::StepFailed {
                step: step.clone(),
                output: error_text,
            });
        }
    }
    Ok(())
}
