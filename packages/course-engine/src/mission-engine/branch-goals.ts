/**
 * branch-goals.ts
 * Goal checks about branches: which exist, where HEAD is, what a branch's history holds and
 * whether one branch is merged into another. Pure functions on a snapshot.
 * Branch names may be local ("main") or remote-tracking ("origin/main") unless noted.
 */

import type { BranchGoalCheck } from '../types/mission.ts';
import type { RepoSnapshot } from '../types/repo-snapshot.ts';
import { findBranch, findHistory, messageContains } from './commit-walk.ts';

/**
 * Checks one branch goal.
 * @param goalCheck - a goal like { check: "branch-exists", branch: "feature" }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isBranchGoalMet(goalCheck: BranchGoalCheck, snapshot: RepoSnapshot): boolean {
	switch (goalCheck.check) {
		case 'branch-exists':
			return hasLocalBranch(snapshot, goalCheck.branch);
		case 'branch-is-missing':
			return !hasLocalBranch(snapshot, goalCheck.branch);
		case 'head-is-on-branch':
			return snapshot.head.kind === 'branch' && snapshot.head.branchName === goalCheck.branch;
		case 'head-is-detached':
			return snapshot.head.kind === 'detached';
		case 'branch-is-merged-into':
			return isMergedInto(snapshot, goalCheck.branch, goalCheck.into);
		case 'branch-contains-commit':
			return doesBranchContain(snapshot, goalCheck.branch, goalCheck.message) === true;
		case 'branch-lacks-commit':
			return doesBranchContain(snapshot, goalCheck.branch, goalCheck.message) === false;
		case 'branch-is-at-commit':
			return isBranchAt(snapshot, goalCheck.branch, goalCheck.message);
	}
}

/**
 * Tells whether a local branch exists. A branch made on a brand-new repository has no commit
 * yet, so Git lists no branch; HEAD still names it, and that counts.
 * @param snapshot - the repo state
 * @param branchName - the local branch's name
 * @returns true if the branch exists
 */
function hasLocalBranch(snapshot: RepoSnapshot, branchName: string): boolean {
	const isListed = snapshot.branches.some(
		(branch) => !branch.isRemote && branch.name === branchName
	);
	const isUnbornHead = snapshot.head.kind === 'branch' && snapshot.head.branchName === branchName;
	return isListed || isUnbornHead;
}

/**
 * Tells whether one branch is merged into another: the first branch's newest commit is part
 * of the second branch's history.
 * @param snapshot - the repo state
 * @param branchName - the branch that should be merged
 * @param intoName - the branch it should be merged into
 * @returns true if merged; false if either branch is missing
 */
function isMergedInto(snapshot: RepoSnapshot, branchName: string, intoName: string): boolean {
	const branch = findBranch(snapshot, branchName);
	const intoBranch = findBranch(snapshot, intoName);
	if (branch === null || intoBranch === null) {
		return false;
	}
	const intoHistory = findHistory(snapshot, intoBranch.commitId);
	return intoHistory.some((commit) => commit.id === branch.commitId);
}

/**
 * Tells whether a branch's history holds a commit whose message contains a text.
 * @param snapshot - the repo state
 * @param branchName - the branch
 * @param message - the text to look for in commit messages
 * @returns true or false, or null when the branch does not exist (so neither
 *   "contains" nor "lacks" is met by a missing branch)
 */
function doesBranchContain(
	snapshot: RepoSnapshot,
	branchName: string,
	message: string
): boolean | null {
	const branch = findBranch(snapshot, branchName);
	if (branch === null) {
		return null;
	}
	const history = findHistory(snapshot, branch.commitId);
	return history.some((commit) => messageContains(commit, message));
}

/**
 * Tells whether a branch points at a commit whose message contains a text.
 * @param snapshot - the repo state
 * @param branchName - the branch
 * @param message - the text to look for in the newest commit's message
 * @returns true if the branch's newest commit matches
 */
function isBranchAt(snapshot: RepoSnapshot, branchName: string, message: string): boolean {
	const branch = findBranch(snapshot, branchName);
	const tipCommit = snapshot.commits.find((commit) => commit.id === branch?.commitId);
	return tipCommit !== undefined && messageContains(tipCommit, message);
}
