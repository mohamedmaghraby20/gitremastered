/**
 * commit-walk.ts
 * Small helpers for walking a snapshot's history: finding a commit, the commit HEAD is on,
 * and everything reachable from a commit by following parent links. The goal checks use
 * them to answer questions like "is this branch merged into main?".
 */

import type { Branch, Commit, RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Finds the commit HEAD is on.
 * @param snapshot - the repo state
 * @returns the commit, or null before the first commit
 */
export function findHeadCommit(snapshot: RepoSnapshot): Commit | null {
	const headCommitId = snapshot.head.commitId;
	return snapshot.commits.find((commit) => commit.id === headCommitId) ?? null;
}

/**
 * Finds a branch by name, local ("main") or remote-tracking ("origin/main").
 * @param snapshot - the repo state
 * @param branchName - the name to look for
 * @returns the branch, or null when there is none
 */
export function findBranch(snapshot: RepoSnapshot, branchName: string): Branch | null {
	return snapshot.branches.find((branch) => branch.name === branchName) ?? null;
}

/**
 * Lists a commit and all its ancestors: every commit you reach by following parent links.
 * This is the history of whatever points at the start commit.
 * @param snapshot - the repo state
 * @param startCommitId - where to start (null gives an empty history)
 * @returns the commits, the start first
 */
export function findHistory(snapshot: RepoSnapshot, startCommitId: string | null): Commit[] {
	const commitsById = new Map(snapshot.commits.map((commit) => [commit.id, commit]));
	const history: Commit[] = [];
	const seenIds = new Set<string>();
	const waitingIds = startCommitId === null ? [] : [startCommitId];
	while (waitingIds.length > 0) {
		const commitId = waitingIds.pop() as string;
		const commit = commitsById.get(commitId);
		if (commit === undefined || seenIds.has(commitId)) {
			continue;
		}
		seenIds.add(commitId);
		history.push(commit);
		waitingIds.push(...commit.parentIds);
	}
	return history;
}

/**
 * Tells whether a commit message contains a text, ignoring upper and lower case.
 * @param commit - the commit
 * @param text - the text to look for
 * @returns true if the first line of the message contains the text
 */
export function messageContains(commit: Commit, text: string): boolean {
	return commit.message.toLowerCase().includes(text.toLowerCase());
}
