/**
 * goal-checker.test.ts
 * Tests for every goal check kind against sample snapshots.
 */

import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '../types/repo-snapshot.ts';
import { checkGoals, isGoalMet } from './goal-checker.ts';

/**
 * Builds a snapshot from an empty repo plus the given changes.
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
		sparseSkippedFiles: [],
		...changes
	};
}

const oneCommit: RepoSnapshot['commits'] = [
	{
		id: 'a'.repeat(40),
		message: 'Add README',
		parentIds: [],
		authorName: 'Student',
		authoredAt: '2026-11-25T10:00:00+00:00',
		isReachable: true,
		isSigned: false,
		changedPaths: []
	}
];

const notesChange = { path: 'notes.txt', changeKind: 'added' as const, oldPath: null };

describe('isGoalMet', () => {
	it('is never met before the first snapshot', () => {
		expect(isGoalMet({ check: 'commit-count-at-least', count: 0 }, null)).toBe(false);
	});

	it('file-is-untracked', () => {
		const goal = { check: 'file-is-untracked' as const, file: 'notes.txt' };
		expect(isGoalMet(goal, snapshotWith({ untrackedFiles: ['notes.txt'] }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('file-is-modified', () => {
		const goal = { check: 'file-is-modified' as const, file: 'notes.txt' };
		expect(isGoalMet(goal, snapshotWith({ modifiedFiles: [notesChange] }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({ stagedFiles: [notesChange] }))).toBe(false);
	});

	it('file-is-staged', () => {
		const goal = { check: 'file-is-staged' as const, file: 'notes.txt' };
		expect(isGoalMet(goal, snapshotWith({ stagedFiles: [notesChange] }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({ untrackedFiles: ['notes.txt'] }))).toBe(false);
	});

	it('file-is-committed needs the file in the latest commit and nothing left to save', () => {
		const goal = { check: 'file-is-committed' as const, file: 'notes.txt' };
		const committed = { commits: oneCommit, committedFiles: ['notes.txt'] };
		expect(isGoalMet(goal, snapshotWith(committed))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({}))).toBe(false);
		expect(isGoalMet(goal, snapshotWith({ ...committed, stagedFiles: [notesChange] }))).toBe(false);
		expect(isGoalMet(goal, snapshotWith({ ...committed, modifiedFiles: [notesChange] }))).toBe(
			false
		);
	});

	it('file-is-committed is not met by a file that was never committed (pilot review finding)', () => {
		// The student deleted notes.txt and made an empty commit: no pending change, but no save either.
		const goal = { check: 'file-is-committed' as const, file: 'notes.txt' };
		const deletedInstead = { commits: oneCommit, committedFiles: ['README.md'] };
		expect(isGoalMet(goal, snapshotWith(deletedInstead))).toBe(false);
	});

	it('commit-count-at-least', () => {
		const goal = { check: 'commit-count-at-least' as const, count: 1 };
		// Commits are counted from HEAD back, so HEAD has to be on the commit.
		const head = { kind: 'branch' as const, branchName: 'main', commitId: oneCommit[0].id };
		expect(isGoalMet(goal, snapshotWith({ commits: oneCommit, head }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('file-exists and file-is-missing follow the working tree', () => {
		const exists = { check: 'file-exists' as const, file: 'notes.txt' };
		const missing = { check: 'file-is-missing' as const, file: 'notes.txt' };
		const committed = { commits: oneCommit, committedFiles: ['notes.txt'] };
		const deleted = { path: 'notes.txt', changeKind: 'deleted' as const, oldPath: null };

		expect(isGoalMet(exists, snapshotWith({ untrackedFiles: ['notes.txt'] }))).toBe(true);
		expect(isGoalMet(exists, snapshotWith({ stagedFiles: [notesChange] }))).toBe(true);
		expect(isGoalMet(exists, snapshotWith(committed))).toBe(true);
		expect(isGoalMet(missing, snapshotWith({}))).toBe(true);
		// Deleted with rm (not staged) or with git rm (staged): gone from the folder either way.
		expect(isGoalMet(missing, snapshotWith({ ...committed, modifiedFiles: [deleted] }))).toBe(true);
		expect(isGoalMet(missing, snapshotWith({ ...committed, stagedFiles: [deleted] }))).toBe(true);
		// git rm --cached: the deletion is staged, but the file is still in the folder, untracked.
		const keptOnDisk = { ...committed, stagedFiles: [deleted], untrackedFiles: ['notes.txt'] };
		expect(isGoalMet(exists, snapshotWith(keptOnDisk))).toBe(true);
	});

	it('sends each kind of goal to the file that checks it', () => {
		expect(isGoalMet({ check: 'head-is-on-branch', branch: 'main' }, snapshotWith({}))).toBe(true);
		expect(isGoalMet({ check: 'stash-count-is', count: 0 }, snapshotWith({}))).toBe(true);
		expect(isGoalMet({ check: 'tag-is-missing', tag: 'v1.0' }, snapshotWith({}))).toBe(true);
	});

	it('working-folder-clean', () => {
		const goal = { check: 'working-folder-clean' as const };
		expect(isGoalMet(goal, snapshotWith({ commits: oneCommit }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({ untrackedFiles: ['x'] }))).toBe(false);
	});
});

describe('checkGoals', () => {
	it('checks every goal, in order', () => {
		const results = checkGoals(
			[
				{ check: 'file-is-staged', file: 'notes.txt' },
				{ check: 'commit-count-at-least', count: 1 }
			],
			snapshotWith({ stagedFiles: [notesChange] })
		);
		expect(results).toEqual([true, false]);
	});
});
