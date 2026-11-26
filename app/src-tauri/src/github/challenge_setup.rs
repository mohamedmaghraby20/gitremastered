//! Builds a GitHub challenge (task 85): the steps around the ordinary practice setup.
//!
//! 1. Before: check consent and the signed-in login, make the guarded `PracticeRepo`, create
//!    it on GitHub if needed, and clear what an earlier attempt left there.
//! 2. The ordinary setup steps run with `PRACTICE_GITHUB_URL` set, and push the starting state.
//! 3. After: `main` becomes the default branch, then the scripted teammate steps run.
//!
//! A challenge may also name an `upstream` repository: "the shared project" in lessons about
//! forks (assumption A4). Setup lines reach it through `PRACTICE_GITHUB_UPSTREAM_URL`, the
//! teammate steps act on it, and the goal checks read it. The student's own repository then
//! only receives their pushes.

use serde::{Deserialize, Serialize};

use super::connection::require_login;
use super::practice_repo::PracticeRepo;
use super::repo_writes::{create_if_missing, reset_to_clean, use_main_as_default};
use super::teammate::{TeammateStep, run_teammate_steps};

/// The environment variable that tells setup steps where the practice repository is.
pub const PRACTICE_URL_VARIABLE: &str = "PRACTICE_GITHUB_URL";

/// The environment variable for the "upstream" repository, when a challenge has one.
pub const UPSTREAM_URL_VARIABLE: &str = "PRACTICE_GITHUB_UPSTREAM_URL";

/// A challenge's `github` field from challenges.yaml.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GitHubChallenge {
    /// The practice repository's name, like `gitremastered-practice-flow`.
    pub repo: String,
    /// An optional second practice repository: the shared project the student "forked".
    #[serde(default)]
    pub upstream: Option<String>,
    /// What "a teammate" does on GitHub once the setup has pushed (on the upstream if any).
    #[serde(default)]
    pub teammate: Vec<TeammateStep>,
}

/// A GitHub challenge's guarded repositories and the environment for its setup steps.
pub struct PreparedChallenge {
    /// The student's practice repository.
    pub repo: PracticeRepo,
    /// The shared project, for fork lessons; `None` otherwise.
    pub upstream: Option<PracticeRepo>,
    /// `PRACTICE_GITHUB_URL` (and `PRACTICE_GITHUB_UPSTREAM_URL`) for the setup steps.
    pub environment: Vec<(String, String)>,
}

impl PreparedChallenge {
    /// The repository the teammate acts on and the goals read: the upstream, if there is one.
    /// Input: none. Output: that repository.
    pub fn shared_repo(&self) -> &PracticeRepo {
        self.upstream.as_ref().unwrap_or(&self.repo)
    }
}

/// Step 1: everything before the setup steps run.
///
/// Inputs: the challenge's GitHub field and whether the student gave consent.
/// Output: the guarded repositories and the environment, or a sentence that says what is
/// missing.
pub fn prepare_github_challenge(
    challenge: &GitHubChallenge,
    has_consent: bool,
) -> Result<PreparedChallenge, String> {
    if !has_consent {
        return Err(
            "GitHub challenges need your consent first: the app creates and resets a practice repository on your account"
                .to_string(),
        );
    }
    let login = require_login()?;
    let repo = prepare_one_repo(&login, &challenge.repo)?;
    let mut environment = vec![(PRACTICE_URL_VARIABLE.to_string(), repo.clone_url())];
    let upstream = match &challenge.upstream {
        Some(upstream_name) => {
            let upstream = prepare_one_repo(&login, upstream_name)?;
            environment.push((UPSTREAM_URL_VARIABLE.to_string(), upstream.clone_url()));
            Some(upstream)
        }
        None => None,
    };
    Ok(PreparedChallenge {
        repo,
        upstream,
        environment,
    })
}

/// Guards, creates (if needed) and clears one practice repository.
///
/// Inputs: the signed-in login and the repository's name. Output: the guarded repository.
fn prepare_one_repo(login: &str, name: &str) -> Result<PracticeRepo, String> {
    let repo = PracticeRepo::new(login, name, login)?;
    create_if_missing(&repo)?;
    reset_to_clean(&repo)?;
    Ok(repo)
}

/// Step 3: everything after the setup steps ran.
///
/// Inputs: the prepared repositories and the challenge. Output: nothing, or the first error.
pub fn finish_github_challenge(
    prepared: &PreparedChallenge,
    challenge: &GitHubChallenge,
) -> Result<(), String> {
    use_main_as_default(&prepared.repo)?;
    if let Some(upstream) = &prepared.upstream {
        use_main_as_default(upstream)?;
    }
    run_teammate_steps(prepared.shared_repo(), &challenge.teammate)
}
