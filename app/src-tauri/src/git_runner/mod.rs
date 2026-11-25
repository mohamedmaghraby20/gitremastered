//! The git-runner module (SPEC.md section 3.2): everything that runs programs for a mission.
//!
//! - `hidden_command`: starts programs without flashing a console window on Windows.
//! - `shell_choice`: finds the shell (Git Bash on Windows, bash elsewhere).
//! - `practice_folder`: the only place the app's own commands may run.
//! - `setup_steps`: runs a mission's setup commands inside a practice folder.

pub mod hidden_command;
pub mod practice_folder;
pub mod setup_steps;
pub mod shell_choice;
