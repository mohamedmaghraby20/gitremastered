/**
 * area-zones.test.ts
 * Tests for sorting a snapshot into the desk's three zones, for every snapshot case of task 15.
 */

import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { findNewSheets, sortFilesIntoZones } from './area-zones';

/**
 * Builds a snapshot: an empty repo on main, with the given changes.
 * @param changes - the fields to fill in
 * @returns the snapshot
 */
function snapshotWith(changes: Partial<RepoSnapshot>): RepoSnapshot {
	return {
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
		answer: null,
		workingFileTexts: [],
		committedFileTexts: [],
		worktrees: [],
		submodules: [],
		...changes
	};
}

/**
 * Builds a commit with a made-up 40-character ID.
 * @param idLetter - repeated to make the ID
 * @param message - the commit message
 * @returns the commit
 */
function commit(idLetter: string, message: string): RepoSnapshot['commits'][number] {
	return {
		id: idLetter.repeat(40),
		message,
		parentIds: [],
		authorName: 'Student',
		authoredAt: '2026-11-25T10:00:00+00:00',
		isReachable: true,
		isSigned: false,
		changedPaths: []
	};
}

describe('sortFilesIntoZones', () => {
	it('shows an empty desk for an empty repo', () => {
		expect(sortFilesIntoZones(snapshotWith({}))).toEqual({
			working: [],
			staging: [],
			repository: { commitCount: 0, latestCommits: [] }
		});
	});

	it('marks a file with a merge conflict, and leaves lost commits out of the repository', () => {
		const lostCommit = { ...commit('c', 'Old version'), isReachable: false };
		const zones = sortFilesIntoZones(
			snapshotWith({
				commits: [lostCommit, commit('a', 'Add README')],
				modifiedFiles: [{ path: 'app.js', changeKind: 'modified', oldPath: null }],
				conflictedFiles: ['app.js']
			})
		);
		expect(zones.working).toEqual([{ path: 'app.js', label: 'conflict' }]);
		expect(zones.repository.commitCount).toBe(1);
		expect(zones.repository.latestCommits).toEqual([{ shortId: 'aaaaaaa', message: 'Add README' }]);
	});

	it('puts an untracked file in the working tree, marked new', () => {
		const zones = sortFilesIntoZones(snapshotWith({ untrackedFiles: ['notes.txt'] }));
		expect(zones.working).toEqual([{ path: 'notes.txt', label: 'new' }]);
	});

	it('puts a staged file in the staging area', () => {
		const zones = sortFilesIntoZones(
			snapshotWith({ stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }] })
		);
		expect(zones.working).toEqual([]);
		expect(zones.staging).toEqual([{ path: 'notes.txt', label: 'new' }]);
	});

	it('shows commits newest first with short IDs, and an edited file', () => {
		const zones = sortFilesIntoZones(
			snapshotWith({
				commits: [commit('b', 'Second commit'), commit('a', 'First commit')],
				modifiedFiles: [{ path: 'notes.txt', changeKind: 'modified', oldPath: null }]
			})
		);
		expect(zones.repository).toEqual({
			commitCount: 2,
			latestCommits: [
				{ shortId: 'bbbbbbb', message: 'Second commit' },
				{ shortId: 'aaaaaaa', message: 'First commit' }
			]
		});
		expect(zones.working).toEqual([{ path: 'notes.txt', label: 'edited' }]);
	});

	it('shows a file staged and then edited again in both zones', () => {
		const change = { path: 'app.js', changeKind: 'modified' as const, oldPath: null };
		const zones = sortFilesIntoZones(
			snapshotWith({ stagedFiles: [change], modifiedFiles: [change] })
		);
		expect(zones.staging).toEqual([{ path: 'app.js', label: 'edited' }]);
		expect(zones.working).toEqual([{ path: 'app.js', label: 'edited' }]);
	});
});

describe('findNewSheets', () => {
	it('outlines nothing on the first snapshot', () => {
		const zones = sortFilesIntoZones(snapshotWith({ untrackedFiles: ['notes.txt'] }));
		expect(findNewSheets(null, zones).size).toBe(0);
	});

	it('outlines a file that just moved to the staging area', () => {
		const before = sortFilesIntoZones(snapshotWith({ untrackedFiles: ['notes.txt'] }));
		const after = sortFilesIntoZones(
			snapshotWith({ stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }] })
		);
		expect([...findNewSheets(before, after)]).toEqual(['staging:notes.txt']);
	});
});
