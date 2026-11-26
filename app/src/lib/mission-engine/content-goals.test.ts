/**
 * content-goals.test.ts
 * Tests for the goal checks about what a file says and whether any commit still holds it.
 * Each check gets a snapshot that meets it and one that does not.
 */

import { describe, expect, it } from 'vitest';
import { sampleCommit, snapshotWith } from '$lib/types/snapshot-samples';
import { isContentGoalMet } from './content-goals';

/** menu.txt is resolved on disk; the latest commit still has the conflict markers. */
const resolvedOnDisk = snapshotWith({
	workingFileTexts: [{ path: 'menu.txt', text: 'Tea: 2.00\nCoffee: 2.50\n' }],
	committedFileTexts: [{ path: 'menu.txt', text: '<<<<<<< HEAD\nTea: 2.00\n=======\n' }]
});

describe('isContentGoalMet', () => {
	it('file-contains and file-lacks read the working tree, letter case counts', () => {
		const contains = { check: 'file-contains' as const, file: 'menu.txt', text: 'Coffee: 2.50' };
		expect(isContentGoalMet(contains, resolvedOnDisk)).toBe(true);
		expect(isContentGoalMet({ ...contains, text: 'coffee: 2.50' }, resolvedOnDisk)).toBe(false);

		const lacks = { check: 'file-lacks' as const, file: 'menu.txt', text: '<<<<<<<' };
		expect(isContentGoalMet(lacks, resolvedOnDisk)).toBe(true);
		expect(isContentGoalMet({ ...lacks, text: 'Tea' }, resolvedOnDisk)).toBe(false);
	});

	it('a file that is not there neither contains nor lacks anything', () => {
		const lacks = { check: 'file-lacks' as const, file: 'gone.txt', text: 'secret' };
		const contains = { check: 'file-contains' as const, file: 'gone.txt', text: 'secret' };
		expect(isContentGoalMet(lacks, resolvedOnDisk)).toBe(false);
		expect(isContentGoalMet(contains, resolvedOnDisk)).toBe(false);
	});

	it('committed-file-contains and committed-file-lacks read the latest commit', () => {
		const contains = {
			check: 'committed-file-contains' as const,
			file: 'menu.txt',
			text: '======='
		};
		expect(isContentGoalMet(contains, resolvedOnDisk)).toBe(true);
		const lacks = { check: 'committed-file-lacks' as const, file: 'menu.txt', text: '<<<<<<<' };
		expect(isContentGoalMet(lacks, resolvedOnDisk)).toBe(false);
	});

	it('file-is-in-no-commit ignores commits only the reflog remembers', () => {
		const goal = { check: 'file-is-in-no-commit' as const, file: 'secrets.env' };
		const lostCommit = {
			...sampleCommit('a1', 'Add secrets', [], false),
			changedPaths: ['secrets.env']
		};
		const keptCommit = { ...sampleCommit('b2', 'Add secrets'), changedPaths: ['secrets.env'] };
		expect(isContentGoalMet(goal, snapshotWith({ commits: [lostCommit] }))).toBe(true);
		expect(isContentGoalMet(goal, snapshotWith({ commits: [keptCommit] }))).toBe(false);
	});
});
