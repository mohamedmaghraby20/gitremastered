//! Sorts the commits Git remembers into three groups:
//!
//! - reachable: a branch, a tag or HEAD leads to them (the normal history);
//! - lost: only the reflog still knows them, for example the old commit after
//!   `git commit --amend` or the commits `git reset` moved away from. They stay in the
//!   snapshot, marked `is_reachable: false`, so the map can show what really happened;
//! - stash commits: how `git stash` stores work internally. They are removed: a stash is
//!   shown as a stash, not as history.
//!
//! "Reachable" means: start at a branch, tag or HEAD and follow parent links.

use std::collections::{HashMap, HashSet};

use crate::models::repo_snapshot::Commit;

/// Marks each commit as reachable or lost, and drops the stash's internal commits.
///
/// Inputs: every commit from `git log --reflog`, the commit IDs that branches, tags and HEAD
/// point to, and the ID of each stash entry. Output: the commits to show, in the same order.
pub fn mark_reachability(
    commits: Vec<Commit>,
    tip_ids: &[String],
    stash_ids: &[String],
) -> Vec<Commit> {
    let stash_internal_ids = find_stash_internal_ids(&commits, stash_ids);
    let reachable_ids = find_reachable_ids(&commits, tip_ids);
    commits
        .into_iter()
        .filter(|commit| {
            reachable_ids.contains(&commit.id) || !stash_internal_ids.contains(&commit.id)
        })
        .map(|commit| Commit {
            is_reachable: reachable_ids.contains(&commit.id),
            ..commit
        })
        .collect()
}

/// Follows parent links from the tips and collects every commit met on the way.
///
/// Inputs: the commits and the tip IDs. Output: the IDs of all reachable commits.
fn find_reachable_ids(commits: &[Commit], tip_ids: &[String]) -> HashSet<String> {
    let parents_by_id: HashMap<&str, &Vec<String>> = commits
        .iter()
        .map(|commit| (commit.id.as_str(), &commit.parent_ids))
        .collect();
    let mut reachable_ids = HashSet::new();
    let mut waiting: Vec<&str> = tip_ids.iter().map(String::as_str).collect();
    while let Some(commit_id) = waiting.pop() {
        let is_new = reachable_ids.insert(commit_id.to_string());
        if !is_new {
            continue;
        }
        if let Some(parent_ids) = parents_by_id.get(commit_id) {
            waiting.extend(parent_ids.iter().map(String::as_str));
        }
    }
    reachable_ids
}

/// Lists the commits `git stash` made for its own bookkeeping. A stash entry is a commit
/// whose first parent is the commit you were on; its other parents hold the staging area
/// and the untracked files.
///
/// Inputs: the commits and the stash entry IDs. Output: the stash entries plus their extra
/// parents.
fn find_stash_internal_ids(commits: &[Commit], stash_ids: &[String]) -> HashSet<String> {
    let mut internal_ids: HashSet<String> = stash_ids.iter().cloned().collect();
    for commit in commits {
        if stash_ids.contains(&commit.id) {
            internal_ids.extend(commit.parent_ids.iter().skip(1).cloned());
        }
    }
    internal_ids
}

#[cfg(test)]
mod tests {
    use super::mark_reachability;
    use crate::models::repo_snapshot::Commit;

    /// Builds a commit. Inputs: its ID and its parents' IDs. Output: the commit.
    fn commit(id: &str, parent_ids: &[&str]) -> Commit {
        Commit {
            id: id.to_string(),
            message: id.to_string(),
            parent_ids: parent_ids.iter().map(|parent| parent.to_string()).collect(),
            author_name: "Student".to_string(),
            authored_at: "2026-11-26T10:00:00+00:00".to_string(),
            is_reachable: true,
        }
    }

    /// After an amend, the old commit is still listed, marked as lost.
    #[test]
    fn marks_a_commit_no_branch_reaches() {
        let commits = vec![
            commit("old", &["first"]),
            commit("new", &["first"]),
            commit("first", &[]),
        ];

        let marked = mark_reachability(commits, &["new".to_string()], &[]);

        let reachable: Vec<(&str, bool)> = marked
            .iter()
            .map(|commit| (commit.id.as_str(), commit.is_reachable))
            .collect();
        assert_eq!(
            reachable,
            vec![("old", false), ("new", true), ("first", true)]
        );
    }

    /// A stash entry and the extra commits behind it are left out.
    #[test]
    fn drops_the_stash_commits() {
        let commits = vec![
            commit("stash", &["first", "index", "untracked"]),
            commit("index", &["first"]),
            commit("untracked", &[]),
            commit("first", &[]),
        ];

        let marked = mark_reachability(commits, &["first".to_string()], &["stash".to_string()]);

        let ids: Vec<&str> = marked.iter().map(|commit| commit.id.as_str()).collect();
        assert_eq!(ids, vec!["first"]);
    }
}
