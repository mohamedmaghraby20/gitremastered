/**
 * file-goals.ts
 * Goal checks about one file: where it is among the working tree, the staging area and the
 * latest commit. Pure functions on a snapshot.
 */

import type { FileGoalCheck } from '../types/challenge.ts';
import type { FileChange, RepoSnapshot } from '../types/repo-snapshot.ts';

/**
 * Checks one file goal.
 * @param goalCheck - a goal like { check: "file-is-committed", file: "notes.txt" }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isFileGoalMet(goalCheck: FileGoalCheck, snapshot: RepoSnapshot): boolean {
	switch (goalCheck.check) {
		case 'file-is-untracked':
			return snapshot.untrackedFiles.includes(goalCheck.file);
		case 'file-is-modified':
			return isInChanges(snapshot.modifiedFiles, goalCheck.file);
		case 'file-is-staged':
			return isInChanges(snapshot.stagedFiles, goalCheck.file);
		case 'file-is-committed':
			return isFileCommitted(goalCheck.file, snapshot);
		case 'file-is-not-committed':
			return !snapshot.committedFiles.includes(goalCheck.file);
		case 'file-exists':
			return doesFileExist(goalCheck.file, snapshot);
		case 'file-is-missing':
			return !doesFileExist(goalCheck.file, snapshot);
		case 'working-folder-clean':
			return (
				snapshot.stagedFiles.length === 0 &&
				snapshot.modifiedFiles.length === 0 &&
				snapshot.untrackedFiles.length === 0
			);
	}
}

/**
 * Tells whether a file is saved in the latest commit with nothing left to save: it is in
 * HEAD's files, and not staged or changed since. (Checking only "no pending change" was not
 * enough: a deleted or never-created file has no pending change either.)
 * @param file - the file's path
 * @param snapshot - the repo state
 * @returns true if the file is committed
 */
function isFileCommitted(file: string, snapshot: RepoSnapshot): boolean {
	const fileIsInLatestCommit = snapshot.committedFiles.includes(file);
	const fileIsStaged = isInChanges(snapshot.stagedFiles, file);
	const fileIsModified = isInChanges(snapshot.modifiedFiles, file);
	return fileIsInLatestCommit && !fileIsStaged && !fileIsModified;
}

/**
 * Tells whether a file is in the working tree right now. The snapshot does not list the
 * folder's files, so this is worked out: a file exists when it is untracked, newly staged,
 * or in the latest commit, unless a pending change deleted it. (An ignored file is never
 * listed, so it counts as missing.)
 * @param file - the file's path
 * @param snapshot - the repo state
 * @returns true if the file exists
 */
function doesFileExist(file: string, snapshot: RepoSnapshot): boolean {
	const isDeletedInWorkingTree = hasChange(snapshot.modifiedFiles, file, 'deleted');
	const isDeletionStaged = hasChange(snapshot.stagedFiles, file, 'deleted');
	const isLeftOutBySparseCheckout = snapshot.sparseSkippedFiles.includes(file);
	if (isDeletedInWorkingTree || isLeftOutBySparseCheckout) {
		return false;
	}
	if (snapshot.untrackedFiles.includes(file)) {
		return true;
	}
	const isKnownToGit =
		snapshot.committedFiles.includes(file) || isInChanges(snapshot.stagedFiles, file);
	return isKnownToGit && !isDeletionStaged;
}

/**
 * Looks for a file in a list of changes.
 * @param changes - staged or modified files
 * @param file - the file's path
 * @returns true if the file is in the list
 */
function isInChanges(changes: FileChange[], file: string): boolean {
	return changes.some((change) => change.path === file);
}

/**
 * Looks for one kind of change to a file.
 * @param changes - staged or modified files
 * @param file - the file's path
 * @param changeKind - the kind of change to look for
 * @returns true if the list holds that change
 */
function hasChange(
	changes: FileChange[],
	file: string,
	changeKind: FileChange['changeKind']
): boolean {
	return changes.some((change) => change.path === file && change.changeKind === changeKind);
}
