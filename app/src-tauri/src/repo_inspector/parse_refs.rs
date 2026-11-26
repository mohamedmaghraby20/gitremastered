//! Reads the output of `git for-each-ref` in our own format (see `REFS_FORMAT`):
//! branches, remote-tracking branches and tags, with the commit each one points to, and for
//! local branches the branch they follow ("upstream") and how far apart the two are.

use crate::models::repo_snapshot::{Branch, Tag};

/// The `--format` for `git for-each-ref`, five fields split by the unit separator (0x1F):
/// the full ref name, its object, the commit behind an annotated tag (`%(*objectname)`, empty
/// otherwise), the upstream branch (`origin/main`, empty without one) and the distance to it
/// (`ahead 1, behind 2`, `gone`, or empty when both are level).
pub const REFS_FORMAT: &str = "--format=%(refname)%1f%(objectname)%1f%(*objectname)%1f%(upstream:short)%1f%(upstream:track,nobracket)";

/// Branches and tags found in the refs output.
#[derive(Debug, Default, PartialEq)]
pub struct RefsSummary {
    pub branches: Vec<Branch>,
    pub tags: Vec<Tag>,
}

/// The fields of one ref line after the name.
struct RefFields<'line> {
    object_id: &'line str,
    peeled_commit_id: &'line str,
    upstream: &'line str,
    track: &'line str,
}

/// Reads every ref line.
///
/// Input: the raw output, one ref per line. Output: the branches and tags.
pub fn parse_refs(refs_output: &str) -> RefsSummary {
    let mut summary = RefsSummary::default();
    for line in refs_output.lines() {
        let mut fields = line.split('\u{1f}');
        let (Some(ref_name), Some(object_id)) = (fields.next(), fields.next()) else {
            continue;
        };
        let ref_fields = RefFields {
            object_id,
            peeled_commit_id: fields.next().unwrap_or_default(),
            upstream: fields.next().unwrap_or_default(),
            track: fields.next().unwrap_or_default(),
        };
        add_ref(&mut summary, ref_name, &ref_fields);
    }
    summary
}

/// Adds one ref to the right list.
///
/// Inputs: the summary (changed in place), the full ref name and its other fields.
/// Output: none.
fn add_ref(summary: &mut RefsSummary, ref_name: &str, fields: &RefFields) {
    if let Some(branch_name) = ref_name.strip_prefix("refs/heads/") {
        let (ahead, behind) = parse_track(fields.track);
        summary.branches.push(Branch {
            name: branch_name.to_string(),
            commit_id: fields.object_id.to_string(),
            is_remote: false,
            upstream: (!fields.upstream.is_empty()).then(|| fields.upstream.to_string()),
            ahead,
            behind,
        });
    } else if let Some(remote_branch_name) = ref_name.strip_prefix("refs/remotes/") {
        // "origin/HEAD" only says which branch the remote calls its default; skip it.
        if !remote_branch_name.ends_with("/HEAD") {
            summary.branches.push(Branch {
                name: remote_branch_name.to_string(),
                commit_id: fields.object_id.to_string(),
                is_remote: true,
                upstream: None,
                ahead: 0,
                behind: 0,
            });
        }
    } else if let Some(tag_name) = ref_name.strip_prefix("refs/tags/") {
        // An annotated tag points at a tag object; the commit behind it is the "peeled" ID.
        let is_annotated = !fields.peeled_commit_id.is_empty();
        let commit_id = if is_annotated {
            fields.peeled_commit_id
        } else {
            fields.object_id
        };
        summary.tags.push(Tag {
            name: tag_name.to_string(),
            commit_id: commit_id.to_string(),
            is_annotated,
        });
    }
}

/// Reads the distance to the upstream branch.
///
/// Input: text like `ahead 2`, `behind 1`, `ahead 2, behind 1`, `gone` or empty.
/// Output: (ahead, behind); both 0 when the text names neither.
fn parse_track(track: &str) -> (u32, u32) {
    let mut ahead = 0;
    let mut behind = 0;
    for part in track.split(", ") {
        if let Some(count) = part.strip_prefix("ahead ") {
            ahead = count.parse().unwrap_or(0);
        } else if let Some(count) = part.strip_prefix("behind ") {
            behind = count.parse().unwrap_or(0);
        }
    }
    (ahead, behind)
}

#[cfg(test)]
mod tests {
    use super::parse_refs;

    /// Local and remote branches and both kinds of tags.
    #[test]
    fn reads_branches_and_tags() {
        let output = "refs/heads/main\u{1f}aaa\u{1f}\u{1f}\u{1f}\n\
                      refs/remotes/origin/HEAD\u{1f}aaa\u{1f}\u{1f}\u{1f}\n\
                      refs/remotes/origin/main\u{1f}aaa\u{1f}\u{1f}\u{1f}\n\
                      refs/tags/v1\u{1f}aaa\u{1f}\u{1f}\u{1f}\n\
                      refs/tags/v2\u{1f}ttt\u{1f}bbb\u{1f}\u{1f}\n";

        let summary = parse_refs(output);

        let branch_names: Vec<&str> = summary.branches.iter().map(|b| b.name.as_str()).collect();
        assert_eq!(branch_names, vec!["main", "origin/main"]);
        assert!(summary.branches[1].is_remote);
        assert_eq!(summary.tags[0].commit_id, "aaa");
        assert!(!summary.tags[0].is_annotated);
        // An annotated tag points at a tag object; we want the commit behind it.
        assert_eq!(summary.tags[1].commit_id, "bbb");
        assert!(summary.tags[1].is_annotated);
    }

    /// A branch that follows `origin/main` carries its upstream and the distance to it.
    #[test]
    fn reads_the_upstream_and_the_distance_to_it() {
        let output = "refs/heads/main\u{1f}aaa\u{1f}\u{1f}origin/main\u{1f}ahead 2, behind 1\n\
                      refs/heads/level\u{1f}aaa\u{1f}\u{1f}origin/level\u{1f}\n\
                      refs/heads/alone\u{1f}aaa\u{1f}\u{1f}\u{1f}\n";

        let branches = parse_refs(output).branches;

        assert_eq!(branches[0].upstream.as_deref(), Some("origin/main"));
        assert_eq!((branches[0].ahead, branches[0].behind), (2, 1));
        assert_eq!((branches[1].ahead, branches[1].behind), (0, 0));
        assert_eq!(branches[2].upstream, None);
    }
}
