/**
 * goal-checker.ts
 * Decides whether a mission's goals are reached, by reading the current repo snapshot.
 * Pure functions: no screen code, no Git, so every goal kind is tested with sample snapshots.
 */

import type { GoalCheck } from '$lib/types/mission';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Checks one goal against the repo snapshot.
 * @param goalCheck - the goal from mission.yaml, e.g. { check: "file-is-committed", file: "notes.txt" }
 * @param repoSnapshot - the repo state right now (null before the first snapshot arrives)
 * @returns true if the goal is met
 */
export function isGoalMet(goalCheck: GoalCheck, repoSnapshot: RepoSnapshot | null): boolean {
	if (repoSnapshot === null) {
		return false;
	}
	switch (goalCheck.check) {
		case 'file-is-untracked':
			return repoSnapshot.untrackedFiles.includes(goalCheck.file);
		case 'file-is-modified':
			return isInChanges(repoSnapshot.modifiedFiles, goalCheck.file);
		case 'file-is-staged':
			return isInChanges(repoSnapshot.stagedFiles, goalCheck.file);
		case 'file-is-committed':
			return isFileCommitted(goalCheck.file, repoSnapshot);
		case 'file-is-not-committed':
			return !repoSnapshot.committedFiles.includes(goalCheck.file);
		case 'commit-count-at-least':
			return repoSnapshot.commits.length >= goalCheck.count;
		case 'working-folder-clean':
			return (
				repoSnapshot.stagedFiles.length === 0 &&
				repoSnapshot.modifiedFiles.length === 0 &&
				repoSnapshot.untrackedFiles.length === 0
			);
	}
}

/**
 * Checks every goal of a mission.
 * @param goalChecks - the mission's goals, in order
 * @param repoSnapshot - the repo state right now
 * @returns one true/false per goal, in the same order
 */
export function checkGoals(goalChecks: GoalCheck[], repoSnapshot: RepoSnapshot | null): boolean[] {
	return goalChecks.map((goalCheck) => isGoalMet(goalCheck, repoSnapshot));
}

/**
 * Tells whether a file is saved in the latest commit with nothing left to save: it is in
 * HEAD's files, and not staged or changed since. (Checking only "no pending change" was not
 * enough: a deleted or never-created file has no pending change either.)
 * @param file - the file's path
 * @param repoSnapshot - the repo state
 * @returns true if the file is committed
 */
function isFileCommitted(file: string, repoSnapshot: RepoSnapshot): boolean {
	const fileIsInLatestCommit = repoSnapshot.committedFiles.includes(file);
	const fileIsStaged = isInChanges(repoSnapshot.stagedFiles, file);
	const fileIsModified = isInChanges(repoSnapshot.modifiedFiles, file);
	return fileIsInLatestCommit && !fileIsStaged && !fileIsModified;
}

/**
 * Looks for a file in a list of changes.
 * @param changes - staged or modified files
 * @param file - the file's path
 * @returns true if the file is in the list
 */
function isInChanges(changes: RepoSnapshot['stagedFiles'], file: string): boolean {
	return changes.some((change) => change.path === file);
}
