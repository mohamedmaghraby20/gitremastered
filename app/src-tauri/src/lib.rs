//! The core of GitRemastered: builds and starts the Tauri app.
//!
//! Later tasks register the contract commands here (see SPEC.md section 3.3).

/// Starts the desktop app and keeps it running until the window closes.
///
/// Inputs: none. Output: none; it panics with a message if Tauri cannot start.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running the GitRemastered app");
}
