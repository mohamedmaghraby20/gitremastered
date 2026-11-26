//! Builds a GitHub challenge (task 85): the steps around the ordinary practice setup.
//!
//! 1. Before: check consent and the signed-in login, make the guarded `PracticeRepo`, create
//!    it on GitHub if needed, and clear what an earlier attempt left there.
//! 2. The ordinary setup steps run with `PRACTICE_GITHUB_URL` set, and push the starting state.
//! 3. After: `main` becomes the default branch, then the scripted teammate steps run.

use serde::{Deserialize, Serialize};

use super::connection::require_login;
use super::practice_repo::PracticeRepo;
use super::repo_writes::{create_if_missing, reset_to_clean, use_main_as_default};
use super::teammate::{TeammateStep, run_teammate_steps};

/// The environment variable that tells setup steps where the practice repository is.
pub const PRACTICE_URL_VARIABLE: &str = "PRACTICE_GITHUB_URL";

/// A challenge's `github` field from challenges.yaml.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubChallenge {
    /// The practice repository's name, like `gitremastered-practice-flow`.
    pub repo: String,
    /// What "a teammate" does on GitHub once the setup has pushed.
    #[serde(default)]
    pub teammate: Vec<TeammateStep>,
}

/// Step 1: everything before the setup steps run.
///
/// Inputs: the challenge's GitHub field and whether the student gave consent.
/// Output: the guarded repository and the environment for the setup steps, or a sentence
/// that says what is missing.
pub fn prepare_github_challenge(
    challenge: &GitHubChallenge,
    has_consent: bool,
) -> Result<(PracticeRepo, Vec<(String, String)>), String> {
    if !has_consent {
        return Err(
            "GitHub challenges need your consent first: the app creates and resets a practice repository on your account"
                .to_string(),
        );
    }
    let login = require_login()?;
    let repo = PracticeRepo::new(&login, &challenge.repo, &login)?;
    create_if_missing(&repo)?;
    reset_to_clean(&repo)?;
    let environment = vec![(PRACTICE_URL_VARIABLE.to_string(), repo.clone_url())];
    Ok((repo, environment))
}

/// Step 3: everything after the setup steps ran.
///
/// Inputs: the guarded repository and the challenge. Output: nothing, or the first error.
pub fn finish_github_challenge(
    repo: &PracticeRepo,
    challenge: &GitHubChallenge,
) -> Result<(), String> {
    use_main_as_default(repo)?;
    run_teammate_steps(repo, &challenge.teammate)
}
