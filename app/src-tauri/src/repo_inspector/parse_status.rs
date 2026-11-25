//! Reads the output of `git status --porcelain=v2 --branch -z --untracked-files=all`.
//!
//! Porcelain v2 is Git's stable, machine-readable status format. With `-z`, entries are
//! separated by a NUL byte (so file names with spaces or newlines are safe). The lines:
//!
//! - `# branch.oid <id>` or `# branch.oid (initial)`: the commit HEAD points to
//! - `# branch.head <name>` or `# branch.head (detached)`: the current branch
//! - `1 XY ... <path>`: a changed file; X = staging area, Y = working folder
//! - `2 XY ... <path>` followed by the old path: a renamed or copied file
//! - `u XY ... <path>`: a file with a merge conflict
//! - `? <path>`: an untracked file
//!
//! Docs: <https://git-scm.com/docs/git-status#_porcelain_format_version_2>

use crate::models::repo_snapshot::{ChangeKind, FileChange, HeadState};

/// Everything the status output tells us.
#[derive(Debug, PartialEq)]
pub struct StatusSummary {
    pub head: HeadState,
    pub staged_files: Vec<FileChange>,
    pub modified_files: Vec<FileChange>,
    pub untracked_files: Vec<String>,
}

/// Reads the whole status output.
///
/// Input: the raw output text (NUL-separated). Output: HEAD and the three file lists.
pub fn parse_status(status_output: &str) -> StatusSummary {
    let mut head_commit: Option<String> = None;
    let mut head_branch: Option<String> = None;
    let mut summary = StatusSummary {
        head: HeadState::Branch {
            branch_name: String::new(),
            commit_id: None,
        },
        staged_files: Vec::new(),
        modified_files: Vec::new(),
        untracked_files: Vec::new(),
    };

    let mut entries = status_output.split('\0').filter(|entry| !entry.is_empty());
    while let Some(entry) = entries.next() {
        if let Some(commit_text) = entry.strip_prefix("# branch.oid ") {
            head_commit = (commit_text != "(initial)").then(|| commit_text.to_string());
        } else if let Some(branch_text) = entry.strip_prefix("# branch.head ") {
            head_branch = (branch_text != "(detached)").then(|| branch_text.to_string());
        } else if let Some(path) = entry.strip_prefix("? ") {
            summary.untracked_files.push(path.to_string());
        } else if entry.starts_with("1 ") || entry.starts_with("u ") {
            add_changed_file(&mut summary, entry, None);
        } else if entry.starts_with("2 ") {
            // A rename entry is followed by one more entry: the old path.
            let old_path = entries.next().map(str::to_string);
            add_changed_file(&mut summary, entry, old_path);
        }
    }

    summary.head = build_head_state(head_branch, head_commit);
    summary
}

/// Decides where HEAD points from the two branch header lines.
///
/// Inputs: the branch name (None if detached) and the commit ID (None before the first commit).
/// Output: the HEAD state.
fn build_head_state(head_branch: Option<String>, head_commit: Option<String>) -> HeadState {
    match (head_branch, head_commit) {
        (Some(branch_name), commit_id) => HeadState::Branch {
            branch_name,
            commit_id,
        },
        (None, Some(commit_id)) => HeadState::Detached { commit_id },
        (None, None) => HeadState::Branch {
            branch_name: String::new(),
            commit_id: None,
        },
    }
}

/// Adds one changed-file entry to the staged list, the modified list, or both.
///
/// Inputs: the summary (changed in place), the entry, and the old path for renames.
/// Output: none.
fn add_changed_file(summary: &mut StatusSummary, entry: &str, old_path: Option<String>) {
    let mut status_letters = entry[2..].chars();
    let staging_letter = status_letters.next().unwrap_or('.');
    let working_letter = status_letters.next().unwrap_or('.');
    let path = read_entry_path(entry);
    let is_conflict = entry.starts_with("u ");

    if let Some(change_kind) = change_kind_for(staging_letter).filter(|_| !is_conflict) {
        summary.staged_files.push(FileChange {
            path: path.clone(),
            change_kind,
            old_path: old_path.clone(),
        });
    }
    let working_kind = if is_conflict {
        Some(ChangeKind::Modified)
    } else {
        change_kind_for(working_letter)
    };
    if let Some(change_kind) = working_kind {
        summary.modified_files.push(FileChange {
            path,
            change_kind,
            old_path: None,
        });
    }
}

/// Reads the path at the end of a changed-file entry. The path may contain spaces, so we
/// skip the fixed number of fields before it instead of splitting the whole line.
///
/// Input: one entry. Output: its path.
fn read_entry_path(entry: &str) -> String {
    let fields_before_path = match entry.chars().next() {
        Some('2') => 9,
        Some('u') => 10,
        _ => 8,
    };
    entry
        .splitn(fields_before_path + 1, ' ')
        .nth(fields_before_path)
        .unwrap_or_default()
        .to_string()
}

/// Turns one status letter into a change kind.
///
/// Input: a letter like `M`, `A`, `D`, `R` or `.` (unchanged). Output: the kind, or None.
fn change_kind_for(status_letter: char) -> Option<ChangeKind> {
    match status_letter {
        'M' | 'T' => Some(ChangeKind::Modified),
        'A' | 'C' => Some(ChangeKind::Added),
        'D' => Some(ChangeKind::Deleted),
        'R' => Some(ChangeKind::Renamed),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Builds a FileChange quickly. Inputs: path and kind. Output: the change.
    fn change(path: &str, change_kind: ChangeKind) -> FileChange {
        FileChange {
            path: path.to_string(),
            change_kind,
            old_path: None,
        }
    }

    /// A brand-new repository: on main, no commit yet, nothing changed.
    #[test]
    fn reads_an_empty_repository() {
        let summary = parse_status("# branch.oid (initial)\0# branch.head main\0");
        assert_eq!(
            summary.head,
            HeadState::Branch {
                branch_name: "main".to_string(),
                commit_id: None
            }
        );
        assert!(summary.staged_files.is_empty());
    }

    /// Staged, modified, both, and untracked files, including a name with spaces.
    #[test]
    fn sorts_files_into_the_three_lists() {
        let output = [
            "# branch.oid 1111111111111111111111111111111111111111",
            "# branch.head main",
            "1 A. N... 000000 100644 100644 0000 1111 notes.txt",
            "1 .M N... 100644 100644 100644 2222 2222 README.md",
            "1 MM N... 100644 100644 100644 3333 4444 my app.js",
            "? draft.txt",
            "",
        ]
        .join("\0");

        let summary = parse_status(&output);

        assert_eq!(
            summary.staged_files,
            vec![
                change("notes.txt", ChangeKind::Added),
                change("my app.js", ChangeKind::Modified)
            ]
        );
        assert_eq!(
            summary.modified_files,
            vec![
                change("README.md", ChangeKind::Modified),
                change("my app.js", ChangeKind::Modified)
            ]
        );
        assert_eq!(summary.untracked_files, vec!["draft.txt".to_string()]);
    }

    /// A staged rename carries the old path, which comes as its own entry.
    #[test]
    fn reads_a_rename_with_its_old_path() {
        let output = "# branch.head main\x002 R. N... 100644 100644 100644 5555 5555 R100 new.txt\0old.txt\0";
        let summary = parse_status(output);
        assert_eq!(
            summary.staged_files,
            vec![FileChange {
                path: "new.txt".to_string(),
                change_kind: ChangeKind::Renamed,
                old_path: Some("old.txt".to_string()),
            }]
        );
    }

    /// A detached HEAD points straight at a commit.
    #[test]
    fn reads_a_detached_head() {
        let output = "# branch.oid abc\0# branch.head (detached)\0";
        assert_eq!(
            parse_status(output).head,
            HeadState::Detached {
                commit_id: "abc".to_string()
            }
        );
    }
}
