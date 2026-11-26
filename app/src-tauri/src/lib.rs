//! The core of GitRemastered: builds and starts the Tauri app.
//!
//! Registers the commands the screens can call (see SPEC.md section 3.3).

pub mod commands;
pub mod git_runner;
pub mod models;
pub mod repo_inspector;

/// Starts the desktop app and keeps it running until the window closes.
///
/// Inputs: none. Output: none; it panics with a message if Tauri cannot start.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Saves progress (finished missions, quiz results, theme) in a JSON file.
        .plugin(tauri_plugin_store::Builder::default().build())
        // Opens the Pro Git citation links in the system browser (https:// only, see capabilities).
        .plugin(tauri_plugin_opener::init())
        // One list of terminal sessions for the whole app; it stops every shell on exit.
        .manage(git_runner::terminal_session::TerminalSessions::new())
        // The watcher of the open lesson's practice folder (one at a time).
        .manage(repo_inspector::watcher::ActiveRepoWatcher::new())
        .invoke_handler(tauri::generate_handler![
            commands::git_info::get_git_version,
            commands::practice::open_practice_repo,
            commands::practice::find_practice_repo,
            commands::practice::reset_practice_repo,
            commands::terminal::start_terminal_session,
            commands::terminal::send_terminal_input,
            commands::terminal::resize_terminal,
            commands::terminal::close_terminal_session,
            commands::snapshot::get_repo_snapshot
        ])
        .run(tauri::generate_context!())
        .expect("error while running the GitRemastered app");
}

#[cfg(test)]
mod tests {
    use serde_json::Value;

    /// Reads the main window's settings from tauri.conf.json.
    ///
    /// Inputs: none. Output: the first entry of `app.windows` as JSON.
    fn read_main_window_settings() -> Value {
        let config_text = include_str!("../tauri.conf.json");
        let config: Value =
            serde_json::from_str(config_text).expect("tauri.conf.json is valid JSON");
        config["app"]["windows"][0].clone()
    }

    /// The window title must say GitRemastered (task 2).
    #[test]
    fn main_window_is_titled_gitremastered() {
        let window = read_main_window_settings();
        assert_eq!(window["title"], "GitRemastered");
    }

    /// The window opens at 1440x900 and cannot shrink below 1024x700 (task 2).
    #[test]
    fn main_window_has_the_designed_size_and_minimum() {
        let window = read_main_window_settings();
        assert_eq!(window["width"], 1440);
        assert_eq!(window["height"], 900);
        assert_eq!(window["minWidth"], 1024);
        assert_eq!(window["minHeight"], 700);
    }
}
