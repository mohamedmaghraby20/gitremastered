//! Tauri commands: the functions the screens can call (SPEC.md section 3.3).
//!
//! One file per command group. The screens call these only through the typed
//! wrappers in `app/src/lib/tauri/commands.ts`.

pub mod git_info;
pub mod practice;
pub mod snapshot;
pub mod terminal;
