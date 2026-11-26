/**
 * snapshot-samples.ts
 * Small builders for sample repo snapshots, used by tests and the dev gallery. A test names
 * only the fields it cares about; everything else is an empty repository on main. When the
 * snapshot gains a field, only this file changes.
 */

import type { Branch, Commit, RepoSnapshot } from './repo-snapshot';

/** An empty repository: on main, no commits, nothing changed. */
export const emptySnapshot: RepoSnapshot = {
	commits: [],
	branches: [],
	tags: [],
	head: { kind: 'branch', branchName: 'main', commitId: null },
	stagedFiles: [],
	modifiedFiles: [],
	untrackedFiles: [],
	committedFiles: [],
	conflictedFiles: [],
	operation: null,
	stashes: [],
	remotes: [],
	localConfig: [],
	answer: null
};

/**
 * Builds a snapshot from an empty repository plus the given fields.
 * @param changes - the fields to fill in
 * @returns the snapshot
 */
export function snapshotWith(changes: Partial<RepoSnapshot>): RepoSnapshot {
	return { ...emptySnapshot, ...changes };
}

/**
 * Builds a commit.
 * @param id - the commit ID
 * @param message - the first line of its message
 * @param parentIds - its parents (none for a first commit)
 * @param isReachable - false for a commit only the reflog remembers
 * @returns the commit, written by "Student" at a fixed time
 */
export function sampleCommit(
	id: string,
	message: string,
	parentIds: string[] = [],
	isReachable = true
): Commit {
	return {
		id,
		message,
		parentIds,
		authorName: 'Student',
		authoredAt: '2026-11-25T10:00:00+00:00',
		isReachable
	};
}

/**
 * Builds a local branch that follows no upstream.
 * @param name - the branch name
 * @param commitId - the commit it points to
 * @returns the branch
 */
export function localBranch(name: string, commitId: string): Branch {
	return { name, commitId, isRemote: false, upstream: null, ahead: 0, behind: 0 };
}

/**
 * Builds a remote-tracking branch.
 * @param name - the branch name, like "origin/main"
 * @param commitId - the commit it points to
 * @returns the branch
 */
export function remoteBranch(name: string, commitId: string): Branch {
	return { name, commitId, isRemote: true, upstream: null, ahead: 0, behind: 0 };
}
