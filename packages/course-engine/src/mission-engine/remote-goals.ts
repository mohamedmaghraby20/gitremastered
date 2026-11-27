/**
 * remote-goals.ts
 * Goal checks about remotes, remote-tracking branches, upstreams and tags. Pure functions
 * on a snapshot.
 */

import type { RemoteGoalCheck } from '../types/mission.ts';
import type { RepoSnapshot } from '../types/repo-snapshot.ts';
import { messageContains } from './commit-walk.ts';

/**
 * Checks one remote or tag goal.
 * @param goalCheck - a goal like { check: "branch-is-in-sync", branch: "main" }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isRemoteGoalMet(goalCheck: RemoteGoalCheck, snapshot: RepoSnapshot): boolean {
	switch (goalCheck.check) {
		case 'remote-exists':
			return snapshot.remotes.some((remote) => remote.name === goalCheck.remote);
		case 'branch-tracks':
			return findLocalBranch(snapshot, goalCheck.branch)?.upstream === goalCheck.upstream;
		case 'branch-is-in-sync':
			return isInSync(snapshot, goalCheck.branch);
		case 'remote-branch-exists':
			return hasRemoteBranch(snapshot, goalCheck.branch);
		case 'remote-branch-is-missing':
			return !hasRemoteBranch(snapshot, goalCheck.branch);
		case 'tag-exists':
			return snapshot.tags.some((tag) => tag.name === goalCheck.tag);
		case 'tag-is-missing':
			return !snapshot.tags.some((tag) => tag.name === goalCheck.tag);
		case 'tag-is-annotated':
			return snapshot.tags.some((tag) => tag.name === goalCheck.tag && tag.isAnnotated);
		case 'tag-is-on-commit':
			return isTagOn(snapshot, goalCheck.tag, goalCheck.message);
		case 'remote-has-tag':
			return snapshot.remotes.some((remote) => remote.tagNames.includes(goalCheck.tag));
	}
}

/**
 * Finds a local branch by name.
 * @param snapshot - the repo state
 * @param branchName - the local branch's name
 * @returns the branch, or undefined
 */
function findLocalBranch(snapshot: RepoSnapshot, branchName: string) {
	return snapshot.branches.find((branch) => !branch.isRemote && branch.name === branchName);
}

/**
 * Tells whether a local branch has an upstream and is level with it: nothing to push,
 * nothing to pull (as far as the last fetch knows).
 * @param snapshot - the repo state
 * @param branchName - the local branch's name
 * @returns true if the branch is in sync with its upstream
 */
function isInSync(snapshot: RepoSnapshot, branchName: string): boolean {
	const branch = findLocalBranch(snapshot, branchName);
	return (
		branch !== undefined && branch.upstream !== null && branch.ahead === 0 && branch.behind === 0
	);
}

/**
 * Tells whether a remote-tracking branch exists.
 * @param snapshot - the repo state
 * @param branchName - its name, like "origin/feature"
 * @returns true if the branch exists
 */
function hasRemoteBranch(snapshot: RepoSnapshot, branchName: string): boolean {
	return snapshot.branches.some((branch) => branch.isRemote && branch.name === branchName);
}

/**
 * Tells whether a tag points at a commit whose message contains a text.
 * @param snapshot - the repo state
 * @param tagName - the tag
 * @param message - the text to look for in the commit's message
 * @returns true if the tag is on such a commit
 */
function isTagOn(snapshot: RepoSnapshot, tagName: string, message: string): boolean {
	const tag = snapshot.tags.find((candidate) => candidate.name === tagName);
	const commit = snapshot.commits.find((candidate) => candidate.id === tag?.commitId);
	return commit !== undefined && messageContains(commit, message);
}
