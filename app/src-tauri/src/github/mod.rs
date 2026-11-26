//! The GitHub module (phase 6, wave B): the only code that talks to GitHub.
//!
//! Safety rules (tasks/todo.md, "Phase 6 decisions"):
//! - Every write goes through `PracticeRepo`, which refuses any repository whose name does
//!   not start with `gitremastered-practice` or whose owner is not the signed-in user.
//! - Deleting needs the same check plus the student's consent.
//! - `gh` is called with a time limit, never on every snapshot, and no token is ever logged
//!   or shown: errors pass through `redact_tokens`.
//! - The app never stores a token: it uses the student's own `gh` login.
//!
//! - `gh_command`: runs `gh` with a time limit.
//! - `practice_repo`: the guard.
//! - `connection`: who is signed in.
//! - `repo_writes`: create, reset, delete a practice repository.
//! - `teammate`: scripted teammate steps.
//! - `challenge_setup`: the steps around a GitHub challenge's setup.
//! - `state`: reads a practice repository for the goal checks.
//! - `url_text`: puts names safely into API addresses.

pub mod challenge_setup;
pub mod connection;
pub mod gh_command;
pub mod practice_repo;
pub mod repo_writes;
pub mod state;
pub mod teammate;
pub mod url_text;
