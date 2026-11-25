//! Reads the output of `git log` written in our own exact format (see `LOG_FORMAT`).
//!
//! Each commit is one record ending with the "record separator" byte (0x1E), and its fields
//! are split by the "unit separator" byte (0x1F). Commit messages never contain these bytes,
//! so splitting on them is safe, unlike splitting on spaces or newlines.

use crate::models::repo_snapshot::Commit;

/// The `--format` for `git log`: ID, parent IDs, author name, ISO date, first message line.
pub const LOG_FORMAT: &str = "--format=%H%x1f%P%x1f%an%x1f%aI%x1f%s%x1e";

/// Reads every commit from the log output.
///
/// Input: the raw output. Output: the commits in the same order (newest first).
pub fn parse_log(log_output: &str) -> Vec<Commit> {
    log_output
        .split('\u{1e}')
        .map(str::trim)
        .filter(|record| !record.is_empty())
        .filter_map(parse_commit_record)
        .collect()
}

/// Reads one commit record.
///
/// Input: the five fields joined by 0x1F. Output: the commit, or None if a field is missing.
fn parse_commit_record(record: &str) -> Option<Commit> {
    let mut fields = record.split('\u{1f}');
    let id = fields.next()?.to_string();
    let parent_ids = fields
        .next()?
        .split_whitespace()
        .map(str::to_string)
        .collect();
    let author_name = fields.next()?.to_string();
    let authored_at = fields.next()?.to_string();
    let message = fields.next()?.to_string();
    Some(Commit {
        id,
        message,
        parent_ids,
        author_name,
        authored_at,
    })
}

#[cfg(test)]
mod tests {
    use super::parse_log;

    /// Two commits: the newest has the oldest as its parent; the oldest has no parent.
    #[test]
    fn reads_commits_with_their_parents() {
        let output = "bbb\u{1f}aaa\u{1f}Student\u{1f}2026-11-25T10:05:00+00:00\u{1f}Add notes\u{1e}\n\
                      aaa\u{1f}\u{1f}Student\u{1f}2026-11-25T10:00:00+00:00\u{1f}Add README\u{1e}\n";

        let commits = parse_log(output);

        assert_eq!(commits.len(), 2);
        assert_eq!(commits[0].id, "bbb");
        assert_eq!(commits[0].parent_ids, vec!["aaa".to_string()]);
        assert_eq!(commits[0].message, "Add notes");
        assert!(commits[1].parent_ids.is_empty());
    }

    /// A merge commit has two parents.
    #[test]
    fn reads_a_merge_commit() {
        let output =
            "mmm\u{1f}aaa bbb\u{1f}Student\u{1f}2026-11-25T11:00:00+00:00\u{1f}Merge\u{1e}";
        assert_eq!(parse_log(output)[0].parent_ids, vec!["aaa", "bbb"]);
    }

    /// No commits yet: an empty list.
    #[test]
    fn reads_an_empty_log() {
        assert!(parse_log("").is_empty());
    }
}
