//! Facts read straight from files, without starting Git:
//!
//! - which multi-step operation is in progress (Git leaves marker files in `.git`),
//! - the student's answer in `answer.txt`,
//! - the tags of a remote that is a folder on this computer (the practice "origin").
//!
//! Reading files is much faster than starting a Git process (~35 ms each on Windows).

use std::fs;
use std::path::Path;

use crate::models::repo_snapshot::Operation;

/// The file where challenges ask the student to write an answer they found out.
const ANSWER_FILE_NAME: &str = "answer.txt";

/// The longest answer kept; anything longer is cut, so a huge file cannot bloat the snapshot.
const LONGEST_ANSWER: usize = 200;

/// Finds the operation that is waiting to be finished, from Git's marker files.
///
/// Input: the repository's top folder. Output: the operation, or `None` when Git is idle.
pub fn find_operation(repo_folder: &Path) -> Option<Operation> {
    let git_folder = repo_folder.join(".git");
    let markers = [
        ("MERGE_HEAD", Operation::Merge),
        ("rebase-merge", Operation::Rebase),
        ("rebase-apply", Operation::Rebase),
        ("REVERT_HEAD", Operation::Revert),
        ("CHERRY_PICK_HEAD", Operation::CherryPick),
        ("BISECT_LOG", Operation::Bisect),
    ];
    markers
        .into_iter()
        .find(|(marker_name, _)| git_folder.join(marker_name).exists())
        .map(|(_, operation)| operation)
}

/// Reads the student's answer: the first line of `answer.txt` that is not blank.
///
/// Input: the repository's top folder. Output: the answer, trimmed, or `None` without one.
pub fn read_answer(repo_folder: &Path) -> Option<String> {
    let file_text = fs::read_to_string(repo_folder.join(ANSWER_FILE_NAME)).ok()?;
    let first_line = file_text
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())?;
    Some(first_line.chars().take(LONGEST_ANSWER).collect())
}

/// Lists the tags of a remote that is a folder on this computer.
///
/// A real server is never contacted: a URL that is not an existing folder gives no tags.
/// Tags live in `refs/tags/` as one file each, or as lines of `packed-refs` after Git has
/// tidied up; both are read.
///
/// Inputs: the repository's top folder (relative URLs start there) and the remote's URL.
/// Output: the tag names, sorted.
pub fn read_remote_tag_names(repo_folder: &Path, remote_url: &str) -> Vec<String> {
    let remote_folder = repo_folder.join(remote_url);
    if !remote_folder.is_dir() {
        return Vec::new();
    }
    // A bare repository holds refs directly; an ordinary one holds them inside ".git".
    let refs_home = if remote_folder.join(".git").is_dir() {
        remote_folder.join(".git")
    } else {
        remote_folder
    };
    let mut tag_names = read_loose_tag_names(&refs_home.join("refs").join("tags"));
    tag_names.extend(read_packed_tag_names(&refs_home.join("packed-refs")));
    tag_names.sort();
    tag_names.dedup();
    tag_names
}

/// Lists the tags stored as one file each.
///
/// Input: the `refs/tags` folder. Output: the file names (none if the folder is missing).
fn read_loose_tag_names(tags_folder: &Path) -> Vec<String> {
    let Ok(entries) = fs::read_dir(tags_folder) else {
        return Vec::new();
    };
    entries
        .filter_map(Result::ok)
        .filter(|entry| entry.path().is_file())
        .map(|entry| entry.file_name().to_string_lossy().into_owned())
        .collect()
}

/// Lists the tags stored as lines of `packed-refs`, like `<id> refs/tags/v1.0`.
///
/// Input: the `packed-refs` file. Output: the tag names (none if the file is missing).
fn read_packed_tag_names(packed_refs_file: &Path) -> Vec<String> {
    let Ok(file_text) = fs::read_to_string(packed_refs_file) else {
        return Vec::new();
    };
    file_text
        .lines()
        .filter_map(|line| line.split_once(" refs/tags/"))
        .map(|(_, tag_name)| tag_name.trim().to_string())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// No marker file: nothing in progress. A `MERGE_HEAD` file: a merge is waiting.
    #[test]
    fn finds_a_merge_in_progress() {
        let folder = tempfile::tempdir().expect("temporary folder");
        fs::create_dir(folder.path().join(".git")).expect("create .git");
        assert_eq!(find_operation(folder.path()), None);

        fs::write(folder.path().join(".git/MERGE_HEAD"), "abc").expect("write marker");
        assert_eq!(find_operation(folder.path()), Some(Operation::Merge));
    }

    /// The answer is the first non-blank line, trimmed; no file means no answer.
    #[test]
    fn reads_the_first_line_of_the_answer_file() {
        let folder = tempfile::tempdir().expect("temporary folder");
        assert_eq!(read_answer(folder.path()), None);

        fs::write(folder.path().join("answer.txt"), "\n  a1b2c3d  \nmore\n").expect("write");
        assert_eq!(read_answer(folder.path()), Some("a1b2c3d".to_string()));
    }

    /// Tags come from both places Git keeps them; a URL that is no folder gives none.
    #[test]
    fn reads_the_tags_of_a_local_remote() {
        let folder = tempfile::tempdir().expect("temporary folder");
        let remote = folder.path().join("origin.git");
        fs::create_dir_all(remote.join("refs/tags")).expect("create tags folder");
        fs::write(remote.join("refs/tags/v2.0"), "abc").expect("write loose tag");
        fs::write(
            remote.join("packed-refs"),
            "# pack-refs\nabc refs/tags/v1.0\n",
        )
        .expect("write");

        let tag_names = read_remote_tag_names(folder.path(), "origin.git");
        assert_eq!(tag_names, vec!["v1.0".to_string(), "v2.0".to_string()]);

        let no_tags = read_remote_tag_names(folder.path(), "https://example.com/repo.git");
        assert!(no_tags.is_empty());
    }
}
