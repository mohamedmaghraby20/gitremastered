//! Version 3 facts read straight from files, without starting Git:
//!
//! - the texts of small files in the working tree,
//! - linked worktrees (Git keeps one folder per worktree in `.git/worktrees/`),
//! - submodules (listed in `.gitmodules`).
//!
//! Reading files is much faster than starting a Git process (~35 ms each on Windows).

use std::fs;
use std::path::Path;

use crate::models::repo_snapshot::{FileText, Submodule, Worktree};

/// The biggest file whose text is kept: practice files are a few lines, and a cap keeps a
/// stray large file from bloating every snapshot.
pub const LARGEST_TEXT_FILE: u64 = 8 * 1024;

/// The most files whose texts are kept.
pub const MOST_TEXT_FILES: usize = 40;

/// Reads the texts of small files in the working tree.
///
/// Inputs: the repository's top folder and the paths to read (sorted, without repeats).
/// Output: the files that exist, are at most 8 KB and are valid UTF-8 text; at most 40.
pub fn read_working_texts(repo_folder: &Path, paths: &[String]) -> Vec<FileText> {
    paths
        .iter()
        .filter_map(|path| read_small_text(&repo_folder.join(path)).map(|text| (path, text)))
        .take(MOST_TEXT_FILES)
        .map(|(path, text)| FileText {
            path: path.clone(),
            text,
        })
        .collect()
}

/// Reads one file if it is small text.
///
/// A symbolic link is never followed: it could point outside the practice folder, for
/// example at a credentials file (security audit L1).
///
/// Input: the file. Output: its text, or `None` for a missing, large, binary or linked file.
fn read_small_text(file_path: &Path) -> Option<String> {
    let metadata = fs::symlink_metadata(file_path).ok()?;
    if !metadata.is_file() || metadata.len() > LARGEST_TEXT_FILE {
        return None;
    }
    fs::read_to_string(file_path).ok()
}

/// Lists the linked worktrees. Each has a folder `.git/worktrees/<name>/` holding its `HEAD`
/// (like `ref: refs/heads/hotfix`) and `gitdir` (the path of the worktree's `.git` file).
///
/// Input: the repository's top folder. Output: the worktrees, sorted by path.
pub fn read_worktrees(repo_folder: &Path) -> Vec<Worktree> {
    let Ok(entries) = fs::read_dir(repo_folder.join(".git").join("worktrees")) else {
        return Vec::new();
    };
    let mut worktrees: Vec<Worktree> = entries
        .filter_map(Result::ok)
        .filter_map(|entry| read_one_worktree(&entry.path()))
        .collect();
    worktrees.sort_by(|first, second| first.path.cmp(&second.path));
    worktrees
}

/// Reads one worktree's record.
///
/// Input: its folder inside `.git/worktrees/`. Output: the worktree, or `None` if a file is
/// missing.
fn read_one_worktree(record_folder: &Path) -> Option<Worktree> {
    let head_text = fs::read_to_string(record_folder.join("HEAD")).ok()?;
    let gitdir_text = fs::read_to_string(record_folder.join("gitdir")).ok()?;
    let branch = head_text
        .trim()
        .strip_prefix("ref: refs/heads/")
        .map(str::to_string);
    let worktree_git_file = gitdir_text.trim();
    // A worktree whose folder was deleted by hand is only a stale record ("prunable"): it
    // does not count (code review finding 11).
    if !Path::new(worktree_git_file).exists() {
        return None;
    }
    let path = worktree_git_file
        .strip_suffix("/.git")
        .unwrap_or(worktree_git_file)
        .to_string();
    Some(Worktree { path, branch })
}

/// Lists the submodules named in `.gitmodules` (lines like `path = vendor/library`). One
/// counts as initialized once its folder holds a `.git` file or folder.
///
/// Input: the repository's top folder. Output: the submodules, in the file's order.
pub fn read_submodules(repo_folder: &Path) -> Vec<Submodule> {
    let Ok(modules_text) = fs::read_to_string(repo_folder.join(".gitmodules")) else {
        return Vec::new();
    };
    modules_text
        .lines()
        .filter_map(|line| line.trim().strip_prefix("path"))
        .filter_map(|rest| rest.trim().strip_prefix('='))
        .map(|path| path.trim().to_string())
        .map(|path| Submodule {
            is_initialized: repo_folder.join(&path).join(".git").exists(),
            path,
        })
        .collect()
}

/// Lists the committed files a sparse checkout left out of the working tree. Git does not
/// report them as deleted, so without this list they would look present. Runs only when a
/// sparse checkout is set up (`.git/info/sparse-checkout` exists), so it costs nothing else.
///
/// Inputs: the repository's top folder and the files in the latest commit.
/// Output: the committed files that are not on disk.
pub fn read_sparse_skipped_files(repo_folder: &Path, committed_files: &[String]) -> Vec<String> {
    let sparse_settings = repo_folder
        .join(".git")
        .join("info")
        .join("sparse-checkout");
    if !sparse_settings.is_file() {
        return Vec::new();
    }
    committed_files
        .iter()
        .filter(|path| !repo_folder.join(path).exists())
        .cloned()
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Small text files are read; missing and large ones are left out.
    #[test]
    fn reads_small_text_files_only() {
        let folder = tempfile::tempdir().expect("temporary folder");
        fs::write(folder.path().join("menu.txt"), "Tea\n").expect("write");
        fs::write(folder.path().join("big.txt"), "x".repeat(9000)).expect("write");
        let paths = ["big.txt", "gone.txt", "menu.txt"].map(str::to_string);

        let texts = read_working_texts(folder.path(), &paths);

        assert_eq!(
            texts,
            vec![FileText {
                path: "menu.txt".to_string(),
                text: "Tea\n".to_string()
            }]
        );
    }

    /// Without a sparse checkout nothing counts as skipped; with one, files not on disk do.
    #[test]
    fn lists_files_a_sparse_checkout_left_out() {
        let folder = tempfile::tempdir().expect("temporary folder");
        fs::write(folder.path().join("README.md"), "hi").expect("write");
        let committed = ["README.md", "art/ship.png"].map(str::to_string);
        assert!(read_sparse_skipped_files(folder.path(), &committed).is_empty());

        fs::create_dir_all(folder.path().join(".git/info")).expect("create folder");
        fs::write(folder.path().join(".git/info/sparse-checkout"), "/*").expect("write");
        let skipped = read_sparse_skipped_files(folder.path(), &committed);
        assert_eq!(skipped, vec!["art/ship.png".to_string()]);
    }

    /// A worktree on a branch and one with a detached HEAD count; one whose folder was
    /// deleted by hand does not.
    #[test]
    fn reads_linked_worktrees() {
        let folder = tempfile::tempdir().expect("temporary folder");
        let records = folder.path().join(".git/worktrees");
        let worktree_cases = [
            ("hotfix", "ref: refs/heads/hotfix\n", true),
            ("look", "abc123\n", true),
            ("gone", "ref: refs/heads/gone\n", false),
        ];
        for (name, head, folder_exists) in worktree_cases {
            let worktree_folder = folder.path().join("work").join(name);
            if folder_exists {
                fs::create_dir_all(&worktree_folder).expect("create worktree folder");
                fs::write(worktree_folder.join(".git"), "gitdir: x").expect("write .git file");
            }
            fs::create_dir_all(records.join(name)).expect("create record");
            fs::write(records.join(name).join("HEAD"), head).expect("write HEAD");
            let gitdir = format!("{}/.git\n", worktree_folder.display());
            fs::write(records.join(name).join("gitdir"), gitdir).expect("write gitdir");
        }

        let worktrees = read_worktrees(folder.path());

        assert_eq!(worktrees.len(), 2);
        assert!(worktrees[0].path.ends_with("hotfix"));
        assert_eq!(worktrees[0].branch, Some("hotfix".to_string()));
        assert_eq!(worktrees[1].branch, None);
    }

    /// A listed submodule counts as initialized once its folder has a `.git`.
    #[test]
    fn reads_submodules_from_gitmodules() {
        let folder = tempfile::tempdir().expect("temporary folder");
        let modules = "[submodule \"lib\"]\n\tpath = vendor/lib\n\turl = ../lib.git\n";
        fs::write(folder.path().join(".gitmodules"), modules).expect("write");
        assert!(!read_submodules(folder.path())[0].is_initialized);

        fs::create_dir_all(folder.path().join("vendor/lib")).expect("create folder");
        fs::write(folder.path().join("vendor/lib/.git"), "gitdir: x").expect("write");
        let submodules = read_submodules(folder.path());
        assert_eq!(submodules[0].path, "vendor/lib");
        assert!(submodules[0].is_initialized);
    }
}
