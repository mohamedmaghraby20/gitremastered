//! Reads the output of `git log` written in our own exact format (see `LOG_FORMAT`).
//!
//! Each commit is one record that starts with the "record separator" byte (0x1E), and its
//! fields are split by the "unit separator" byte (0x1F). Commit messages never contain these
//! bytes, so splitting on them is safe, unlike splitting on spaces or newlines. After the last
//! field, `--name-only -z` lists the files the commit changed, each ended by a zero byte.

use crate::models::repo_snapshot::Commit;

/// The `--format` for `git log`: ID, parent IDs, author name, ISO date, signature check
/// (`%G?`: `G` or `U` for a good one), first message line. The changed files follow the last 0x1F.
pub const LOG_FORMAT: &str = "--format=%x1e%H%x1f%P%x1f%an%x1f%aI%x1f%G?%x1f%s%x1f";

/// Reads every commit from the log output.
///
/// Input: the raw output. Output: the commits in the same order (newest first).
pub fn parse_log(log_output: &str) -> Vec<Commit> {
    log_output
        .split('\u{1e}')
        .filter(|record| !record.trim().is_empty())
        .filter_map(parse_commit_record)
        .collect()
}

/// Reads one commit record.
///
/// Input: the six fields and the file list, joined by 0x1F. Output: the commit, or None if a
/// field is missing.
fn parse_commit_record(record: &str) -> Option<Commit> {
    let mut fields = record.splitn(7, '\u{1f}');
    let id = fields.next()?.trim().to_string();
    let parent_ids = fields
        .next()?
        .split_whitespace()
        .map(str::to_string)
        .collect();
    let author_name = fields.next()?.to_string();
    let authored_at = fields.next()?.to_string();
    let signature_check = fields.next()?;
    let message = fields.next()?.to_string();
    let changed_paths = parse_changed_paths(fields.next().unwrap_or_default());
    Some(Commit {
        id,
        message,
        parent_ids,
        author_name,
        authored_at,
        // Every commit starts as reachable; `reachability` marks the lost ones afterwards.
        is_reachable: true,
        // G: good signature; U: good signature from a key of unknown trust. Anything else
        // (none, bad, expired, unverifiable) does not count as signed.
        is_signed: matches!(signature_check.trim(), "G" | "U"),
        changed_paths,
    })
}

/// Reads the file list that `--name-only -z` prints after a commit.
///
/// Input: the paths, each ended by a zero byte (with a line break before the first).
/// Output: the paths.
fn parse_changed_paths(file_list: &str) -> Vec<String> {
    file_list
        .split('\0')
        .map(|path| path.trim_matches('\n'))
        .filter(|path| !path.is_empty())
        .map(str::to_string)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::parse_log;

    /// Two commits: the newest has the oldest as its parent and changed one file; the oldest
    /// has no parent and is signed.
    #[test]
    fn reads_commits_with_their_parents_and_files() {
        let output = "\u{1e}bbb\u{1f}aaa\u{1f}Student\u{1f}2026-11-25T10:05:00+00:00\u{1f}N\u{1f}Add notes\u{1f}\0\nnotes.txt\0\
                      \u{1e}aaa\u{1f}\u{1f}Student\u{1f}2026-11-25T10:00:00+00:00\u{1f}G\u{1f}Add README\u{1f}\0\nREADME.md\0docs/a b.md\0";

        let commits = parse_log(output);

        assert_eq!(commits.len(), 2);
        assert_eq!(commits[0].id, "bbb");
        assert_eq!(commits[0].parent_ids, vec!["aaa".to_string()]);
        assert_eq!(commits[0].message, "Add notes");
        assert_eq!(commits[0].changed_paths, vec!["notes.txt".to_string()]);
        assert!(!commits[0].is_signed);
        assert!(commits[1].parent_ids.is_empty());
        assert!(commits[1].is_signed);
        assert_eq!(commits[1].changed_paths, vec!["README.md", "docs/a b.md"]);
    }

    /// A merge commit has two parents and, without `-m`, no file list.
    #[test]
    fn reads_a_merge_commit() {
        let output = "\u{1e}mmm\u{1f}aaa bbb\u{1f}Student\u{1f}2026-11-25T11:00:00+00:00\u{1f}N\u{1f}Merge\u{1f}\0";
        let commits = parse_log(output);
        assert_eq!(commits[0].parent_ids, vec!["aaa", "bbb"]);
        assert!(commits[0].changed_paths.is_empty());
    }

    /// No commits yet: an empty list.
    #[test]
    fn reads_an_empty_log() {
        assert!(parse_log("").is_empty());
    }
}
