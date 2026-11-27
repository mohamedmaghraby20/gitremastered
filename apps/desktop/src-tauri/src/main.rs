//! Program entry point. It only hands over to `gitremastered_lib::run` in `lib.rs`.

// Hides the extra console window on Windows in release builds. Do not remove.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

/// Starts the app.
fn main() {
    gitremastered_lib::run()
}
