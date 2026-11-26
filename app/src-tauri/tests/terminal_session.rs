//! Integration tests for terminal sessions: a real shell (Git Bash on Windows) in a PTY.

use std::sync::mpsc::{self, Receiver};
use std::time::{Duration, Instant};

use gitremastered_lib::git_runner::practice_folder::PracticeRoot;
use gitremastered_lib::git_runner::shell_choice::terminal_shell;
use gitremastered_lib::git_runner::terminal_session::TerminalSessions;

/// What the session callbacks report to the test.
enum SessionEvent {
    Output(String),
    Exited(u32),
}

/// The question Windows' ConPTY asks first: "where is the cursor?". A real terminal screen
/// (xterm.js in the app) answers it by itself; here the test answers "row 1, column 1".
const CURSOR_POSITION_QUESTION: &str = "[6n";
const CURSOR_POSITION_ANSWER: &str = "[1;1R";

/// Collects output until it contains the wanted text, answering cursor questions on the way.
///
/// Inputs: the sessions, the session ID, the event channel, the text to wait for, and how long
/// to wait. Output: all output seen so far. Fails the test on timeout.
fn wait_for_output(
    sessions: &TerminalSessions,
    session_id: &str,
    events: &Receiver<SessionEvent>,
    wanted_text: &str,
    timeout: Duration,
) -> String {
    let deadline = Instant::now() + timeout;
    let mut all_output = String::new();
    while !all_output.contains(wanted_text) {
        let time_left = deadline.saturating_duration_since(Instant::now());
        match events.recv_timeout(time_left) {
            Ok(SessionEvent::Output(text)) => {
                if text.contains(CURSOR_POSITION_QUESTION) {
                    let _ = sessions.send_input(session_id, CURSOR_POSITION_ANSWER);
                }
                all_output.push_str(&text);
            }
            Ok(SessionEvent::Exited(code)) => panic!("shell exited early ({code}): {all_output}"),
            Err(_) => {
                panic!("timed out waiting for {wanted_text:?}; output so far: {all_output:?}")
            }
        }
    }
    all_output
}

/// Starts a session in a fresh practice folder and returns its parts.
///
/// Input: the sessions list. Output: the temporary folder (kept alive), the session ID and events.
fn start_session(
    sessions: &TerminalSessions,
) -> (tempfile::TempDir, String, Receiver<SessionEvent>) {
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root
        .create("terminal-test", &[])
        .expect("practice folder");
    let shell = terminal_shell().expect("a shell is installed");
    let (sender, events) = mpsc::channel();
    let exit_sender = sender.clone();

    let session_id = sessions
        .start(
            &folder,
            &shell,
            (100, 30),
            move |_, text| {
                let _ = sender.send(SessionEvent::Output(text));
            },
            move |_, exit_code| {
                let _ = exit_sender.send(SessionEvent::Exited(exit_code));
            },
        )
        .expect("session starts");
    (temporary_folder, session_id, events)
}

/// Typed commands run in the practice folder, and their output arrives as events.
#[test]
fn runs_git_version_in_the_practice_folder() {
    let sessions = TerminalSessions::new();
    let (_folder, session_id, events) = start_session(&sessions);

    sessions
        .send_input(&session_id, "git --version\r")
        .expect("input is sent");
    let output = wait_for_output(
        &sessions,
        &session_id,
        &events,
        "git version",
        Duration::from_secs(20),
    );
    assert!(output.contains("git version"));

    sessions
        .send_input(&session_id, "basename \"$PWD\"\r")
        .expect("input is sent");
    wait_for_output(
        &sessions,
        &session_id,
        &events,
        "terminal-test",
        Duration::from_secs(20),
    );

    sessions.resize(&session_id, 120, 40).expect("resize works");
    sessions.close(&session_id).expect("close works");
}

/// Git Bash shows our short one-line prompt: the folder's name, not its full path
/// (pilot review, finding 4).
#[cfg(windows)]
#[test]
fn shows_a_short_prompt() {
    let sessions = TerminalSessions::new();
    let (_folder, session_id, events) = start_session(&sessions);

    let output = wait_for_output(
        &sessions,
        &session_id,
        &events,
        "terminal-test",
        Duration::from_secs(20),
    );
    assert!(
        !output.contains("practice/terminal-test"),
        "the prompt still shows the full path: {output:?}"
    );

    sessions.close(&session_id).expect("close works");
}

/// Closing a session stops the shell and removes the session.
#[test]
fn closing_stops_the_shell() {
    let sessions = TerminalSessions::new();
    let (_folder, session_id, events) = start_session(&sessions);
    assert_eq!(sessions.open_session_count(), 1);

    sessions.close(&session_id).expect("close works");

    assert_eq!(sessions.open_session_count(), 0);
    let deadline = Instant::now() + Duration::from_secs(20);
    loop {
        let time_left = deadline.saturating_duration_since(Instant::now());
        match events.recv_timeout(time_left) {
            Ok(SessionEvent::Exited(_)) => break,
            Ok(SessionEvent::Output(_)) => continue,
            Err(_) => panic!("the shell did not stop after close"),
        }
    }
    assert!(sessions.send_input(&session_id, "ls\r").is_err());
}

/// After closing every shell, the practice folder can be deleted and rebuilt, even on Windows
/// (where a folder with a running program inside cannot be deleted).
#[test]
fn reset_works_after_closing_all_shells() {
    let sessions = TerminalSessions::new();
    let temporary_folder = tempfile::tempdir().expect("temporary folder");
    let practice_root = PracticeRoot::open(temporary_folder.path().join("practice")).expect("root");
    let folder = practice_root
        .create("reset-test", &["echo hi > a.txt".to_string()])
        .expect("practice folder");
    let shell = terminal_shell().expect("a shell is installed");
    sessions
        .start(&folder, &shell, (80, 24), |_, _| {}, |_, _| {})
        .expect("session starts");

    sessions.close_all().expect("close all works");
    let reset_folder = practice_root.reset("reset-test");

    assert!(reset_folder.is_ok(), "reset failed: {reset_folder:?}");
    assert_eq!(sessions.open_session_count(), 0);
}
