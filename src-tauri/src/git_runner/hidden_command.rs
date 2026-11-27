//! Builds a `Command` that never opens a console window.
//!
//! On Windows, a desktop app that starts a console program (git, bash) flashes a black
//! window. The `CREATE_NO_WINDOW` flag stops that. On macOS and Linux nothing changes.

use std::ffi::OsStr;
use std::process::Command;

/// Builds a command for a program, with no console window on Windows.
///
/// Input: the program's name or path, like `git` or `C:\Program Files\Git\bin\bash.exe`.
/// Output: the command, ready for arguments.
pub fn hidden_command(program: impl AsRef<OsStr>) -> Command {
    #[allow(unused_mut)] // `mut` is only needed on Windows.
    let mut command = Command::new(program);

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    command
}
