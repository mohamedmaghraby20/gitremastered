/**
 * content-goals.ts
 * Goal checks about what a file says: in the working tree (as it is on disk) or in the latest
 * commit, and whether any commit a branch or tag reaches still holds a file. Lessons use them
 * where a file's name is not enough: a conflict resolved the right way, a secret removed, a
 * commit that holds only part of a change. Pure functions on a snapshot.
 */

import type { ContentGoalCheck } from '$lib/types/mission';
import type { FileText, RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Checks one content goal.
 * @param goalCheck - a goal like { check: "file-contains", file: "menu.txt", text: "Tea" }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isContentGoalMet(goalCheck: ContentGoalCheck, snapshot: RepoSnapshot): boolean {
	switch (goalCheck.check) {
		case 'file-contains':
			return doesTextInclude(snapshot.workingFileTexts, goalCheck.file, goalCheck.text, true);
		case 'file-lacks':
			return doesTextInclude(snapshot.workingFileTexts, goalCheck.file, goalCheck.text, false);
		case 'committed-file-contains':
			return doesTextInclude(snapshot.committedFileTexts, goalCheck.file, goalCheck.text, true);
		case 'committed-file-lacks':
			return doesTextInclude(snapshot.committedFileTexts, goalCheck.file, goalCheck.text, false);
		case 'file-is-in-no-commit':
			return isFileInNoCommit(snapshot, goalCheck.file);
	}
}

/**
 * Tells whether a file's text includes (or lacks) a piece of text. The file must be in the
 * list either way: "lacks" never passes for a file that is not there, so deleting a file does
 * not count as fixing it.
 * @param fileTexts - the files to look in
 * @param path - the file, like "menu.txt"
 * @param text - the text to look for (exact, letter case counts)
 * @param shouldInclude - true for "contains", false for "lacks"
 * @returns true if the file is there and matches
 */
function doesTextInclude(
	fileTexts: FileText[],
	path: string,
	text: string,
	shouldInclude: boolean
): boolean {
	const fileText = fileTexts.find((candidate) => candidate.path === path);
	if (fileText === undefined) {
		return false;
	}
	return fileText.text.includes(text) === shouldInclude;
}

/**
 * Tells whether no commit that a branch, tag or HEAD still reaches ever added or changed a
 * file. Commits only the reflog remembers do not count: no one who clones the repository
 * gets them.
 * @param snapshot - the repo state
 * @param path - the file, like "secrets.env"
 * @returns true if the file is in no reachable commit
 */
function isFileInNoCommit(snapshot: RepoSnapshot, path: string): boolean {
	return !snapshot.commits.some(
		(commit) => commit.isReachable && commit.changedPaths.includes(path)
	);
}
