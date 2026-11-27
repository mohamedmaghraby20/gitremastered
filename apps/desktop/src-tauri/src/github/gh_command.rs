//! Runs the GitHub CLI (`gh`) with a time limit.
//!
//! Every call to GitHub goes through `run_gh`: it never waits for a prompt, stops `gh` after
//! 15 seconds, and removes anything that looks like a token from the error it returns, so a
//! token can never reach the screen or a log.

use std::io::{Read, Write};
use std::process::{Child, Stdio};
use std::thread;
use std::time::{Duration, Instant};

use crate::git_runner::hidden_command::hidden_command;

/// How long one `gh` call may take before it is stopped.
pub const GH_TIME_LIMIT: Duration = Duration::from_secs(15);

/// How often a running `gh` is checked while we wait for it.
const POLL_INTERVAL: Duration = Duration::from_millis(25);

/// What can go wrong when calling `gh`, in words a student can read.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum GhError {
    /// `gh` is not installed (or not on the PATH).
    NotInstalled,
    /// `gh` ran longer than the time limit and was stopped.
    TimedOut,
    /// `gh` finished with an error; the text is its first error line, tokens removed.
    Failed(String),
}

impl std::fmt::Display for GhError {
    /// Writes the error as one readable sentence.
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotInstalled => write!(formatter, "The GitHub CLI (gh) is not installed"),
            Self::TimedOut => write!(
                formatter,
                "GitHub did not answer within {} seconds",
                GH_TIME_LIMIT.as_secs()
            ),
            Self::Failed(message) => write!(formatter, "GitHub said: {message}"),
        }
    }
}

/// Runs `gh` with arguments and, optionally, text on its input (a JSON body for `gh api
/// --input -`, so values never travel as command-line arguments).
///
/// Inputs: the arguments and the input text. Output: what `gh` printed, or an error.
pub fn run_gh(arguments: &[&str], input_text: Option<&str>) -> Result<String, GhError> {
    let input_mode = if input_text.is_some() {
        Stdio::piped()
    } else {
        Stdio::null()
    };
    let mut child = hidden_command("gh")
        .args(arguments)
        // Never ask a question, never page, never print colors or update notes.
        .env("GH_PROMPT_DISABLED", "1")
        .env("GH_NO_UPDATE_NOTIFIER", "1")
        .env("GH_PAGER", "")
        .env("NO_COLOR", "1")
        .stdin(input_mode)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| GhError::NotInstalled)?;
    if let (Some(text), Some(mut input)) = (input_text, child.stdin.take()) {
        // `input` is dropped at the end of this block, which closes it: gh knows the body ended.
        let _ = input.write_all(text.as_bytes());
    }
    let finished = wait_with_time_limit(child, GH_TIME_LIMIT)?;
    if finished.succeeded {
        Ok(finished.output)
    } else {
        Err(GhError::Failed(first_error_line(&finished.error_output)))
    }
}

/// What a finished `gh` left behind.
struct FinishedCall {
    succeeded: bool,
    output: String,
    error_output: String,
}

/// Waits for a program to finish, reading its output on the side so a full pipe never
/// blocks it.
///
/// Inputs: the running child and the time limit. Output: its result, or `TimedOut` (the
/// child is stopped then).
fn wait_with_time_limit(mut child: Child, time_limit: Duration) -> Result<FinishedCall, GhError> {
    let output_reader = read_all_on_the_side(child.stdout.take());
    let error_reader = read_all_on_the_side(child.stderr.take());
    let deadline = Instant::now() + time_limit;
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) if Instant::now() < deadline => thread::sleep(POLL_INTERVAL),
            _ => {
                let _ = child.kill();
                let _ = child.wait();
                return Err(GhError::TimedOut);
            }
        }
    };
    Ok(FinishedCall {
        succeeded: status.success(),
        output: output_reader.join().unwrap_or_default(),
        error_output: error_reader.join().unwrap_or_default(),
    })
}

/// Reads a pipe to the end in its own thread.
///
/// Input: the pipe (if any). Output: a handle that gives the text when joined.
fn read_all_on_the_side<R: Read + Send + 'static>(pipe: Option<R>) -> thread::JoinHandle<String> {
    thread::spawn(move || {
        let mut text = String::new();
        if let Some(mut pipe) = pipe {
            let _ = pipe.read_to_string(&mut text);
        }
        text
    })
}

/// Keeps the first non-blank error line, with tokens removed and a length cap.
///
/// Input: everything `gh` printed as errors. Output: one short, safe line.
fn first_error_line(error_output: &str) -> String {
    let line = error_output
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .unwrap_or("no error message");
    redact_tokens(line).chars().take(200).collect()
}

/// The starts of GitHub's token formats.
const TOKEN_PREFIXES: [&str; 6] = ["ghp_", "gho_", "ghs_", "ghu_", "ghr_", "github_pat_"];

/// Replaces every word that holds something shaped like a GitHub token, or an address with a
/// user name and password in it (`https://user:token@host`), with `[token hidden]`. Words
/// are split on every kind of white space, so a token after a tab or line break is caught too.
///
/// Input: a text. Output: the same text without tokens.
pub fn redact_tokens(text: &str) -> String {
    let words: Vec<&str> = text
        .split_whitespace()
        .map(|word| {
            let has_token_prefix = TOKEN_PREFIXES.iter().any(|prefix| word.contains(prefix));
            let has_address_password = word.contains("://") && word.contains('@');
            let looks_like_token = has_token_prefix || has_address_password;
            if looks_like_token {
                "[token hidden]"
            } else {
                word
            }
        })
        .collect();
    words.join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A token in an error message never comes through.
    #[test]
    fn hides_tokens() {
        let text = "bad credentials for gho_abc123XYZ and github_pat_11AA_x, sorry";
        assert_eq!(
            redact_tokens(text),
            "bad credentials for [token hidden] and [token hidden] sorry"
        );
    }

    /// An address with a password in it is hidden too.
    #[test]
    fn hides_passwords_in_addresses() {
        let text = "fatal: could not read from https://ada:secret123@github.com/ada/x.git";
        assert_eq!(
            redact_tokens(text),
            "fatal: could not read from [token hidden]"
        );
    }

    /// Only the first non-blank line is kept.
    #[test]
    fn keeps_the_first_error_line() {
        assert_eq!(
            first_error_line("\n  HTTP 404: Not Found\nmore"),
            "HTTP 404: Not Found"
        );
    }

    /// A program that runs too long is stopped and reported as timed out.
    #[test]
    fn stops_a_call_that_takes_too_long() {
        let (program, arguments): (&str, Vec<&str>) = if cfg!(windows) {
            ("ping", vec!["-n", "6", "127.0.0.1"])
        } else {
            ("sleep", vec!["5"])
        };
        let child = hidden_command(program)
            .args(arguments)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .expect("program starts");
        let started = Instant::now();

        let result = wait_with_time_limit(child, Duration::from_millis(300));

        assert!(matches!(result, Err(GhError::TimedOut)));
        assert!(started.elapsed() < Duration::from_secs(3));
    }
}
