//! Prints the snapshot of a Git repository as JSON, using the app's own snapshot reader.
//!
//! Used by the mission tests (`pnpm test:missions`), so they check goals against exactly the
//! snapshot the app would see, without a second copy of the parsing code.
//!
//! Run: `cargo run --example print_snapshot -- <practice-root> <folder-inside-it>`

use std::path::PathBuf;
use std::process::ExitCode;

use gitremastered_lib::git_runner::practice_folder::PracticeRoot;
use gitremastered_lib::repo_inspector::snapshot::read_snapshot;

/// Reads the two paths from the command line, prints the snapshot, and reports errors.
///
/// Inputs: none (command-line arguments). Output: exit code 0 on success, 1 on error.
fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let [root_path, folder_path] = arguments.as_slice() else {
        eprintln!("usage: print_snapshot <practice-root> <folder-inside-it>");
        return ExitCode::FAILURE;
    };
    match print_snapshot(PathBuf::from(root_path), PathBuf::from(folder_path)) {
        Ok(()) => ExitCode::SUCCESS,
        Err(message) => {
            eprintln!("{message}");
            ExitCode::FAILURE
        }
    }
}

/// Checks the folder is inside the root, reads its snapshot and prints it as JSON.
///
/// Inputs: the practice root and the folder. Output: nothing, or a readable error.
fn print_snapshot(root_path: PathBuf, folder_path: PathBuf) -> Result<(), String> {
    let practice_root = PracticeRoot::open(root_path).map_err(|error| error.to_string())?;
    let folder = practice_root
        .check_inside(&folder_path)
        .map_err(|error| error.to_string())?;
    let snapshot = read_snapshot(&folder)?;
    let snapshot_json = serde_json::to_string(&snapshot).map_err(|error| error.to_string())?;
    println!("{snapshot_json}");
    Ok(())
}
