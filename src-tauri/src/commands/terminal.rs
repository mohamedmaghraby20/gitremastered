//! Terminal commands: start a shell in a practice folder, send it input, resize it, close it.
//! Output and exits reach the screens as the `terminal_output` and `terminal_exited` events.

use serde::Serialize;
use tauri::{AppHandle, Emitter, Runtime, State};

use super::practice::open_practice_root;
use crate::git_runner::shell_choice::terminal_shell;
use crate::git_runner::terminal_session::TerminalSessions;

/// The `terminal_output` event: a piece of shell output.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalOutputEvent {
    session_id: String,
    text: String,
}

/// The `terminal_exited` event: a shell ended.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct TerminalExitedEvent {
    session_id: String,
    exit_code: u32,
}

/// The size a terminal starts at, before the screen sends its real size.
const STARTING_SIZE: (u16, u16) = (80, 24);

/// Starts a real shell inside a practice folder.
///
/// Input: the practice folder's path (must be inside the practice root).
/// Output: the session ID.
#[tauri::command]
pub async fn start_terminal_session<R: Runtime>(
    app: AppHandle<R>,
    sessions: State<'_, TerminalSessions>,
    practice_folder_path: String,
) -> Result<String, String> {
    let practice_root = open_practice_root(&app)?;
    let folder = practice_root
        .check_inside(std::path::Path::new(&practice_folder_path))
        .map_err(|error| error.to_string())?;
    let shell = terminal_shell()?;

    let output_app = app.clone();
    sessions.start(
        &folder,
        &shell,
        STARTING_SIZE,
        move |session_id, text| {
            let session_id = session_id.to_string();
            let _ = output_app.emit("terminal_output", TerminalOutputEvent { session_id, text });
        },
        move |session_id, exit_code| {
            let session_id = session_id.to_string();
            let _ = app.emit(
                "terminal_exited",
                TerminalExitedEvent {
                    session_id,
                    exit_code,
                },
            );
        },
    )
}

/// Sends typed text to a shell. Inputs: the session ID and the text.
#[tauri::command]
pub async fn send_terminal_input(
    sessions: State<'_, TerminalSessions>,
    session_id: String,
    text: String,
) -> Result<(), String> {
    sessions.send_input(&session_id, &text)
}

/// Tells a shell its new size. Inputs: the session ID, columns and rows.
#[tauri::command]
pub async fn resize_terminal(
    sessions: State<'_, TerminalSessions>,
    session_id: String,
    columns: u16,
    rows: u16,
) -> Result<(), String> {
    sessions.resize(&session_id, columns, rows)
}

/// Stops a shell and forgets its session. Input: the session ID.
#[tauri::command]
pub async fn close_terminal_session(
    sessions: State<'_, TerminalSessions>,
    session_id: String,
) -> Result<(), String> {
    sessions.close(&session_id)
}
