//! Reads the output of `git for-each-ref` in our own format (see `REFS_FORMAT`):
//! branches, remote-tracking branches and tags, with the commit each one points to.

use crate::models::repo_snapshot::{Branch, Tag};

/// The `--format` for `git for-each-ref`: the full ref name, its object, and for annotated
/// tags the commit the tag object points to (`%(*objectname)`, empty otherwise).
pub const REFS_FORMAT: &str = "--format=%(refname)%1f%(objectname)%1f%(*objectname)";

/// Branches and tags found in the refs output.
#[derive(Debug, Default, PartialEq)]
pub struct RefsSummary {
    pub branches: Vec<Branch>,
    pub tags: Vec<Tag>,
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
        let peeled_commit_id = fields.next().unwrap_or_default();
        add_ref(&mut summary, ref_name, object_id, peeled_commit_id);
    }
    summary
}

/// Adds one ref to the right list.
///
/// Inputs: the summary (changed in place), the full ref name, its object ID, and the peeled
/// commit ID for annotated tags (empty otherwise). Output: none.
fn add_ref(summary: &mut RefsSummary, ref_name: &str, object_id: &str, peeled_commit_id: &str) {
    if let Some(branch_name) = ref_name.strip_prefix("refs/heads/") {
        summary.branches.push(Branch {
            name: branch_name.to_string(),
            commit_id: object_id.to_string(),
            is_remote: false,
        });
    } else if let Some(remote_branch_name) = ref_name.strip_prefix("refs/remotes/") {
        // "origin/HEAD" only says which branch the remote calls its default; skip it.
        if !remote_branch_name.ends_with("/HEAD") {
            summary.branches.push(Branch {
                name: remote_branch_name.to_string(),
                commit_id: object_id.to_string(),
                is_remote: true,
            });
        }
    } else if let Some(tag_name) = ref_name.strip_prefix("refs/tags/") {
        let commit_id = if peeled_commit_id.is_empty() {
            object_id
        } else {
            peeled_commit_id
        };
        summary.tags.push(Tag {
            name: tag_name.to_string(),
            commit_id: commit_id.to_string(),
        });
    }
}

#[cfg(test)]
mod tests {
    use super::parse_refs;

    /// Local and remote branches and both kinds of tags.
    #[test]
    fn reads_branches_and_tags() {
        let output = "refs/heads/main\u{1f}aaa\u{1f}\n\
                      refs/remotes/origin/HEAD\u{1f}aaa\u{1f}\n\
                      refs/remotes/origin/main\u{1f}aaa\u{1f}\n\
                      refs/tags/v1\u{1f}aaa\u{1f}\n\
                      refs/tags/v2\u{1f}ttt\u{1f}bbb\n";

        let summary = parse_refs(output);

        let branch_names: Vec<&str> = summary.branches.iter().map(|b| b.name.as_str()).collect();
        assert_eq!(branch_names, vec!["main", "origin/main"]);
        assert!(summary.branches[1].is_remote);
        assert_eq!(summary.tags[0].commit_id, "aaa");
        // An annotated tag points at a tag object; we want the commit behind it.
        assert_eq!(summary.tags[1].commit_id, "bbb");
    }
}
