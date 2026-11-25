/**
 * goal-checker.test.ts
 * Tests for every goal check kind against sample snapshots.
 */

import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { checkGoals, isGoalMet } from './goal-checker';

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
		...changes
	};
}

const oneCommit: RepoSnapshot['commits'] = [
	{
		id: 'a'.repeat(40),
		message: 'Add README',
		parentIds: [],
		authorName: 'Student',
		authoredAt: '2026-11-25T10:00:00+00:00'
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

	it('file-is-committed needs a commit and nothing left to save for the file', () => {
		const goal = { check: 'file-is-committed' as const, file: 'notes.txt' };
		expect(isGoalMet(goal, snapshotWith({ commits: oneCommit }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({}))).toBe(false);
		expect(
			isGoalMet(goal, snapshotWith({ commits: oneCommit, untrackedFiles: ['notes.txt'] }))
		).toBe(false);
		expect(isGoalMet(goal, snapshotWith({ commits: oneCommit, stagedFiles: [notesChange] }))).toBe(
			false
		);
	});

	it('commit-count-at-least', () => {
		const goal = { check: 'commit-count-at-least' as const, count: 1 };
		expect(isGoalMet(goal, snapshotWith({ commits: oneCommit }))).toBe(true);
		expect(isGoalMet(goal, snapshotWith({}))).toBe(false);
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
