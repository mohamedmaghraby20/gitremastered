//! The texts of small files as they are in the latest commit (HEAD).
//!
//! Most files have no pending change, so their committed text is the same as the text on
//! disk, which is already read. Git is started only for the few files that changed, and then
//! once for all of them (`git cat-file --batch`), so a snapshot stays fast.

use std::collections::HashSet;
use std::io::Write;
use std::process::Stdio;

use crate::git_runner::hidden_command::hidden_command;
use crate::git_runner::practice_folder::PracticeFolder;
use crate::models::repo_snapshot::FileText;

use super::workspace_files::{LARGEST_TEXT_FILE, MOST_TEXT_FILES};

/// Builds the committed texts.
///
/// Inputs: the practice folder, every file in the latest commit, the working-tree texts, and
/// the paths with a pending change (staged, modified or conflicted).
/// Output: the small text files of the latest commit, at most 40.
pub fn read_committed_texts(
    folder: &PracticeFolder,
    committed_files: &[String],
    working_texts: &[FileText],
    changed_paths: &HashSet<String>,
) -> Vec<FileText> {
    let changed_committed: Vec<&String> = committed_files
        .iter()
        .filter(|path| changed_paths.contains(*path))
        .collect();
    let mut texts: Vec<FileText> = working_texts
        .iter()
        .filter(|file_text| committed_files.contains(&file_text.path))
        .filter(|file_text| !changed_paths.contains(&file_text.path))
        .cloned()
        .collect();
    if !changed_committed.is_empty() {
        texts.extend(read_blobs_from_head(folder, &changed_committed));
    }
    texts.sort_by(|first, second| first.path.cmp(&second.path));
    texts.truncate(MOST_TEXT_FILES);
    texts
}

/// Reads files from the latest commit with one `git cat-file --batch`.
///
/// Inputs: the practice folder and the paths. Output: the small text files among them
/// (none if Git fails: the snapshot is still useful without them).
fn read_blobs_from_head(folder: &PracticeFolder, paths: &[&String]) -> Vec<FileText> {
    let requests: String = paths.iter().map(|path| format!("HEAD:{path}\n")).collect();
    let Ok(mut child) = hidden_command("git")
        .args(["cat-file", "--batch"])
        .current_dir(folder.path())
        .env("GIT_OPTIONAL_LOCKS", "0")
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
    else {
        return Vec::new();
    };
    if let Some(mut input) = child.stdin.take() {
        // Dropping `input` at the end of this block closes it, so Git knows the list ended.
        let _ = input.write_all(requests.as_bytes());
    }
    let Ok(output) = child.wait_with_output() else {
        return Vec::new();
    };
    parse_batch_output(&output.stdout, paths)
}

/// Reads `git cat-file --batch` output: for each request, either `<id> blob <size>\n` and the
/// content and a line break, or `<request> missing\n`.
///
/// Inputs: the raw output and the paths, in request order. Output: the small text files.
fn parse_batch_output(output: &[u8], paths: &[&String]) -> Vec<FileText> {
    let mut texts = Vec::new();
    let mut position = 0;
    for path in paths {
        let Some(line_end) = find_line_end(output, position) else {
            break;
        };
        let header = String::from_utf8_lossy(&output[position..line_end]).into_owned();
        position = line_end + 1;
        let Some(size) = parse_blob_size(&header) else {
            continue;
        };
        let content_end = (position + size).min(output.len());
        let content = &output[position..content_end];
        // Skip the content and the line break Git adds after it.
        position = content_end + 1;
        if size as u64 <= LARGEST_TEXT_FILE
            && let Ok(text) = std::str::from_utf8(content)
        {
            texts.push(FileText {
                path: (*path).clone(),
                text: text.to_string(),
            });
        }
    }
    texts
}

/// Finds the next line break.
///
/// Inputs: the bytes and where to start. Output: the line break's position, if any.
fn find_line_end(bytes: &[u8], start: usize) -> Option<usize> {
    bytes
        .get(start..)?
        .iter()
        .position(|byte| *byte == b'\n')
        .map(|offset| start + offset)
}

/// Reads the size from a header like `<id> blob 12`.
///
/// Input: the header line. Output: the size, or `None` for a missing or non-file object.
fn parse_blob_size(header: &str) -> Option<usize> {
    let mut parts = header.split_whitespace();
    let _object_id = parts.next()?;
    if parts.next()? != "blob" {
        return None;
    }
    parts.next()?.parse().ok()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Two answers: a found file and a missing one.
    #[test]
    fn reads_found_files_and_skips_missing_ones() {
        let output = b"abc blob 4\nTea\n\nHEAD:gone.txt missing\n";
        let menu = "menu.txt".to_string();
        let gone = "gone.txt".to_string();

        let texts = parse_batch_output(output, &[&menu, &gone]);

        assert_eq!(texts.len(), 1);
        assert_eq!(texts[0].path, "menu.txt");
        assert_eq!(texts[0].text, "Tea\n");
    }

    /// A missing file first does not shift the next answer.
    #[test]
    fn keeps_its_place_after_a_missing_file() {
        let output = b"HEAD:gone.txt missing\nabc blob 3\nhi\n\n";
        let menu = "menu.txt".to_string();
        let gone = "gone.txt".to_string();

        let texts = parse_batch_output(output, &[&gone, &menu]);

        assert_eq!(texts[0].text, "hi\n");
    }
}
