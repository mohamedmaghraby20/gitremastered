/**
 * area-zones.ts
 * Decides what the visualizer's desk shows: which file sheets sit in the working tree and
 * the staging area, and which commits sit in the repository. Pure logic, no screen code.
 */

import type { ChangeKind, RepoSnapshot } from '$lib/types/repo-snapshot';

/** The three zones of the desk, in Git's order. */
export type ZoneName = 'working' | 'staging' | 'repository';

/** One paper sheet on the desk: a file and the small word printed on it. */
export type FileSheetInfo = {
	path: string;
	label: 'new' | 'edited' | 'added' | 'deleted' | 'renamed';
};

/** One commit card in the repository zone. */
export type CommitCardInfo = { shortId: string; message: string };

/** Everything the desk shows. */
export type DeskZones = {
	working: FileSheetInfo[];
	staging: FileSheetInfo[];
	repository: { commitCount: number; latestCommits: CommitCardInfo[] };
};

/** How many commit cards the repository zone shows; older ones are only counted. */
const visibleCommitCount = 3;

/**
 * Sorts a snapshot into the desk's zones.
 * @param snapshot - the repo state
 * @returns the sheets and commit cards per zone
 */
export function sortFilesIntoZones(snapshot: RepoSnapshot): DeskZones {
	const untrackedSheets: FileSheetInfo[] = snapshot.untrackedFiles.map((path) => ({
		path,
		label: 'new'
	}));
	const modifiedSheets: FileSheetInfo[] = snapshot.modifiedFiles.map((change) => ({
		path: change.path,
		label: workingLabel(change.changeKind)
	}));
	const stagedSheets: FileSheetInfo[] = snapshot.stagedFiles.map((change) => ({
		path: change.path,
		label: stagedLabel(change.changeKind)
	}));
	const latestCommits = snapshot.commits.slice(0, visibleCommitCount).map((commit) => ({
		shortId: commit.id.slice(0, 7),
		message: commit.message
	}));
	return {
		working: [...modifiedSheets, ...untrackedSheets],
		staging: stagedSheets,
		repository: { commitCount: snapshot.commits.length, latestCommits }
	};
}

/**
 * Finds the sheets that just arrived in a zone, so the desk can outline them briefly.
 * @param previousZones - what the desk showed before (null on the first snapshot)
 * @param currentZones - what it shows now
 * @returns keys like "staging:notes.txt" for every newly arrived sheet
 */
export function findNewSheets(
	previousZones: DeskZones | null,
	currentZones: DeskZones
): Set<string> {
	const newSheetKeys = new Set<string>();
	if (previousZones === null) {
		return newSheetKeys;
	}
	for (const zoneName of ['working', 'staging'] as const) {
		const previousPaths = new Set(previousZones[zoneName].map((sheet) => sheet.path));
		for (const sheet of currentZones[zoneName]) {
			if (!previousPaths.has(sheet.path)) {
				newSheetKeys.add(sheetKey(zoneName, sheet.path));
			}
		}
	}
	return newSheetKeys;
}

/**
 * Builds the key that names one sheet in one zone.
 * @param zoneName - "working" or "staging"
 * @param path - the file's path
 * @returns e.g. "staging:notes.txt"
 */
export function sheetKey(zoneName: ZoneName, path: string): string {
	return `${zoneName}:${path}`;
}

/**
 * The word on a sheet in the working tree.
 * @param changeKind - what happened to the file
 * @returns "deleted" for deleted files, otherwise "edited"
 */
function workingLabel(changeKind: ChangeKind): FileSheetInfo['label'] {
	return changeKind === 'deleted' ? 'deleted' : 'edited';
}

/**
 * The word on a sheet in the staging area.
 * @param changeKind - what happened to the file
 * @returns "new" for added files, otherwise the change itself
 */
function stagedLabel(changeKind: ChangeKind): FileSheetInfo['label'] {
	if (changeKind === 'added') {
		return 'new';
	}
	if (changeKind === 'modified') {
		return 'edited';
	}
	return changeKind;
}
