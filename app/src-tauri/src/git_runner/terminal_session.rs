//! The student's real shell, running in a pseudo-terminal (PTY) inside a practice folder.
//!
//! A PTY makes the shell believe it talks to a real terminal window, so prompts, colors and
//! line editing work. We use the `portable-pty` library (ConPTY on Windows).
//!
//! Each session has two helper threads:
//! - the reader thread reads output and hands it, in order, to `on_output`;
//! - the waiter thread waits for the shell to end and calls `on_exit` with its exit code.
//!
//! This file knows nothing about Tauri: the callbacks decide what to do with output
//! (the command layer turns them into events), so tests can run without a window.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Mutex;
use std::sync::atomic::{AtomicU64, Ordering};
use std::thread;

use portable_pty::{ChildKiller, CommandBuilder, MasterPty, PtySize, native_pty_system};

use super::output_decoder::OutputDecoder;
use super::practice_folder::PracticeFolder;
use super::shell_choice::ShellLaunch;

/// One running shell.
struct TerminalSession {
    /// Sends typed text to the shell.
    input_writer: Box<dyn Write + Send>,
    /// The terminal side of the PTY, kept to resize it.
    pty_master: Box<dyn MasterPty + Send>,
    /// Stops the shell when the session closes.
    shell_killer: Box<dyn ChildKiller + Send + Sync>,
}

/// Every open session, by ID. The app keeps one of these for its whole life.
#[derive(Default)]
pub struct TerminalSessions {
    sessions: Mutex<HashMap<String, TerminalSession>>,
    last_session_number: AtomicU64,
}

impl TerminalSessions {
    /// Creates an empty list of sessions. Input: none. Output: the list.
    pub fn new() -> Self {
        Self::default()
    }

    /// Starts a shell inside a practice folder.
    ///
    /// Inputs: the folder, how to start the shell, the first size (columns, rows), and two
    /// callbacks: `on_output` gets the session ID and each piece of output text in order,
    /// `on_exit` gets the session ID and the exit code once the shell ends.
    /// Output: the new session's ID, or a readable error.
    pub fn start(
        &self,
        folder: &PracticeFolder,
        shell: &ShellLaunch,
        size: (u16, u16),
        on_output: impl Fn(&str, String) + Send + 'static,
        on_exit: impl FnOnce(&str, u32) + Send + 'static,
    ) -> Result<String, String> {
        // The ID exists before the shell starts, so even its very first output carries it.
        let session_number = self.last_session_number.fetch_add(1, Ordering::SeqCst) + 1;
        let session_id = format!("terminal-{session_number}");

        let pty_pair = native_pty_system()
            .openpty(pty_size(size.0, size.1))
            .map_err(|error| format!("Could not open a terminal ({error})"))?;

        let mut shell_command = CommandBuilder::new(&shell.program);
        shell_command.args(&shell.arguments);
        shell_command.cwd(folder.path());
        for (name, value) in &shell.environment {
            shell_command.env(name, value);
        }
        let mut shell_process = pty_pair
            .slave
            .spawn_command(shell_command)
            .map_err(|error| format!("Could not start the shell ({error})"))?;
        // The shell holds its own end now; keeping ours open would stop "end of output" arriving.
        drop(pty_pair.slave);

        let output_reader = pty_pair
            .master
            .try_clone_reader()
            .map_err(|error| format!("Could not read the terminal ({error})"))?;
        let input_writer = pty_pair
            .master
            .take_writer()
            .map_err(|error| format!("Could not write to the terminal ({error})"))?;
        let shell_killer = shell_process.clone_killer();

        let output_session_id = session_id.clone();
        thread::spawn(move || {
            forward_output(output_reader, |text| on_output(&output_session_id, text));
        });
        let exit_session_id = session_id.clone();
        thread::spawn(move || {
            let exit_code = shell_process
                .wait()
                .map(|status| status.exit_code())
                .unwrap_or(1);
            on_exit(&exit_session_id, exit_code);
        });

        let session = TerminalSession {
            input_writer,
            pty_master: pty_pair.master,
            shell_killer,
        };
        self.lock_sessions()?.insert(session_id.clone(), session);
        Ok(session_id)
    }

    /// Sends typed text (keys, pasted text) to a session's shell.
    ///
    /// Inputs: the session ID and the text. Output: nothing, or an error for an unknown session.
    pub fn send_input(&self, session_id: &str, text: &str) -> Result<(), String> {
        let mut sessions = self.lock_sessions()?;
        let session = find_session(&mut sessions, session_id)?;
        session
            .input_writer
            .write_all(text.as_bytes())
            .and_then(|()| session.input_writer.flush())
            .map_err(|error| format!("Could not send input to the terminal ({error})"))
    }

    /// Tells a session's shell its new size, after the terminal pane changed size.
    ///
    /// Inputs: the session ID, columns and rows. Output: nothing, or an error.
    pub fn resize(&self, session_id: &str, columns: u16, rows: u16) -> Result<(), String> {
        let mut sessions = self.lock_sessions()?;
        let session = find_session(&mut sessions, session_id)?;
        session
            .pty_master
            .resize(pty_size(columns, rows))
            .map_err(|error| format!("Could not resize the terminal ({error})"))
    }

    /// Stops a session's shell and forgets the session. Closing an unknown session is fine.
    ///
    /// Input: the session ID. Output: nothing, or an error if the list is unusable.
    pub fn close(&self, session_id: &str) -> Result<(), String> {
        let removed_session = self.lock_sessions()?.remove(session_id);
        if let Some(mut session) = removed_session {
            // The shell may already have ended; that is fine.
            let _ = session.shell_killer.kill();
        }
        Ok(())
    }

    /// Stops every shell, for example before its practice folder is deleted and rebuilt
    /// (Windows refuses to delete a folder a running program is inside).
    ///
    /// Input: none. Output: nothing, or an error if the list is unusable.
    pub fn close_all(&self) -> Result<(), String> {
        let removed_sessions: Vec<TerminalSession> = self
            .lock_sessions()?
            .drain()
            .map(|(_, session)| session)
            .collect();
        for mut session in removed_sessions {
            let _ = session.shell_killer.kill();
        }
        Ok(())
    }

    /// How many sessions are open. Input: none. Output: the count (0 if the list is unusable).
    pub fn open_session_count(&self) -> usize {
        self.sessions
            .lock()
            .map(|sessions| sessions.len())
            .unwrap_or(0)
    }

    /// Locks the session list for one change.
    ///
    /// Input: none. Output: the locked list, or an error if a thread crashed while holding it.
    fn lock_sessions(
        &self,
    ) -> Result<std::sync::MutexGuard<'_, HashMap<String, TerminalSession>>, String> {
        self.sessions
            .lock()
            .map_err(|_| "The terminal list is broken; restart the app".to_string())
    }
}

impl Drop for TerminalSessions {
    /// Stops every shell when the app closes, so no shell keeps running in the background.
    fn drop(&mut self) {
        if let Ok(sessions) = self.sessions.get_mut() {
            for session in sessions.values_mut() {
                let _ = session.shell_killer.kill();
            }
        }
    }
}

/// Reads the shell's output until it ends, passing each piece of text on in order.
///
/// Inputs: the PTY's output reader and the callback. Output: none; returns when output ends.
fn forward_output(mut output_reader: Box<dyn Read + Send>, on_output: impl Fn(String)) {
    let mut decoder = OutputDecoder::new();
    let mut buffer = [0_u8; 8192];
    loop {
        match output_reader.read(&mut buffer) {
            Ok(0) | Err(_) => return,
            Ok(byte_count) => {
                let text = decoder.decode(&buffer[..byte_count]);
                if !text.is_empty() {
                    on_output(text);
                }
            }
        }
    }
}

/// Finds a session by ID.
///
/// Inputs: the session list and the ID. Output: the session, or an error naming the ID.
fn find_session<'list>(
    sessions: &'list mut HashMap<String, TerminalSession>,
    session_id: &str,
) -> Result<&'list mut TerminalSession, String> {
    sessions
        .get_mut(session_id)
        .ok_or_else(|| format!("There is no terminal session \"{session_id}\""))
}

/// Builds a PTY size from columns and rows (pixel sizes are not used).
///
/// Inputs: columns and rows. Output: the size.
fn pty_size(columns: u16, rows: u16) -> PtySize {
    PtySize {
        rows,
        cols: columns,
        pixel_width: 0,
        pixel_height: 0,
    }
}
