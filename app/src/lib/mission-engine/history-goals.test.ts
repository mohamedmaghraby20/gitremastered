/**
 * history-goals.test.ts
 * Tests for the goal checks about HEAD's history, work in progress, settings and answers.
 * Each check gets a snapshot that meets it and one that does not.
 */

import { describe, expect, it } from 'vitest';
import { localBranch, sampleCommit, snapshotWith } from '$lib/types/snapshot-samples';
import { isHistoryGoalMet } from './history-goals';

const firstId = 'a'.repeat(40);
const secondId = 'b'.repeat(40);
const lostId = 'c'.repeat(40);

/** main has two commits; a third commit lost its branch (an amend) and must not be counted. */
const twoCommits = snapshotWith({
	commits: [
		sampleCommit(lostId, 'Fix tpyo', [firstId], false),
		sampleCommit(secondId, 'Fix typo in README', [firstId]),
		sampleCommit(firstId, 'Add README')
	],
	branches: [localBranch('main', secondId)],
	head: { kind: 'branch', branchName: 'main', commitId: secondId }
});

describe('isHistoryGoalMet', () => {
	it('commit-count-at-least and commit-count-is count only HEAD history', () => {
		expect(isHistoryGoalMet({ check: 'commit-count-at-least', count: 2 }, twoCommits)).toBe(true);
		expect(isHistoryGoalMet({ check: 'commit-count-at-least', count: 3 }, twoCommits)).toBe(false);
		expect(isHistoryGoalMet({ check: 'commit-count-is', count: 2 }, twoCommits)).toBe(true);
		expect(isHistoryGoalMet({ check: 'commit-count-is', count: 3 }, twoCommits)).toBe(false);
	});

	it('latest-commit-message-contains looks at the commit HEAD is on, in any case', () => {
		const goal = { check: 'latest-commit-message-contains' as const, text: 'fix TYPO' };
		expect(isHistoryGoalMet(goal, twoCommits)).toBe(true);
		expect(isHistoryGoalMet({ ...goal, text: 'Add README' }, twoCommits)).toBe(false);
		expect(isHistoryGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('commit-exists and commit-is-gone search HEAD history, not lost commits', () => {
		expect(isHistoryGoalMet({ check: 'commit-exists', message: 'Add README' }, twoCommits)).toBe(
			true
		);
		expect(isHistoryGoalMet({ check: 'commit-exists', message: 'tpyo' }, twoCommits)).toBe(false);
		expect(isHistoryGoalMet({ check: 'commit-is-gone', message: 'tpyo' }, twoCommits)).toBe(true);
		expect(isHistoryGoalMet({ check: 'commit-is-gone', message: 'Add README' }, twoCommits)).toBe(
			false
		);
	});

	it('head-commit-is-merge needs two parents', () => {
		const mergeId = 'd'.repeat(40);
		const merged = snapshotWith({
			commits: [sampleCommit(mergeId, 'Merge feature', [secondId, lostId]), ...twoCommits.commits],
			head: { kind: 'branch', branchName: 'main', commitId: mergeId }
		});
		expect(isHistoryGoalMet({ check: 'head-commit-is-merge' }, merged)).toBe(true);
		expect(isHistoryGoalMet({ check: 'head-commit-is-merge' }, twoCommits)).toBe(false);
	});

	it('no-operation-in-progress fails during a merge or with a conflicted file', () => {
		const goal = { check: 'no-operation-in-progress' as const };
		expect(isHistoryGoalMet(goal, twoCommits)).toBe(true);
		expect(isHistoryGoalMet(goal, snapshotWith({ operation: 'merge' }))).toBe(false);
		expect(isHistoryGoalMet(goal, snapshotWith({ conflictedFiles: ['app.js'] }))).toBe(false);
	});

	it('stash-count-is', () => {
		const goal = { check: 'stash-count-is' as const, count: 1 };
		expect(isHistoryGoalMet(goal, snapshotWith({ stashes: ['WIP on main'] }))).toBe(true);
		expect(isHistoryGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('config-is compares the key in any case and the value exactly', () => {
		const configured = snapshotWith({ localConfig: [{ key: 'user.name', value: 'Ada Lovelace' }] });
		const goal = { check: 'config-is' as const, key: 'User.Name', value: 'Ada Lovelace' };
		expect(isHistoryGoalMet(goal, configured)).toBe(true);
		expect(isHistoryGoalMet({ ...goal, value: 'ada lovelace' }, configured)).toBe(false);
		expect(isHistoryGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('answer-is ignores case and outer spaces', () => {
		const goal = { check: 'answer-is' as const, answer: 'README.md' };
		expect(isHistoryGoalMet(goal, snapshotWith({ answer: ' readme.md ' }))).toBe(true);
		expect(isHistoryGoalMet(goal, snapshotWith({ answer: 'notes.txt' }))).toBe(false);
		expect(isHistoryGoalMet(goal, snapshotWith({}))).toBe(false);
	});

	it('answer-is-commit accepts a short or full ID of the commit with that message', () => {
		const goal = { check: 'answer-is-commit' as const, message: 'Add README' };
		const answered = (answer: string) => ({ ...twoCommits, answer });
		expect(isHistoryGoalMet(goal, answered('aaaaaaa'))).toBe(true);
		expect(isHistoryGoalMet(goal, answered(firstId))).toBe(true);
		expect(isHistoryGoalMet(goal, answered('bbbbbbb'))).toBe(false);
		// Too short to name one commit.
		expect(isHistoryGoalMet(goal, answered('aa'))).toBe(false);
	});
});

describe('isHistoryGoalMet, version 3 checks', () => {
	const mergeId = 'd'.repeat(40);
	const sideId = 'e'.repeat(40);
	/** main: Add README, then a side commit merged back in. */
	const withMerge = snapshotWith({
		commits: [
			sampleCommit(mergeId, 'Merge branch side', [secondId, sideId]),
			sampleCommit(sideId, 'Side work', [firstId]),
			sampleCommit(secondId, 'Fix typo in README', [firstId]),
			sampleCommit(firstId, 'Add README')
		],
		head: { kind: 'branch', branchName: 'main', commitId: mergeId }
	});

	it('history-is-linear fails as soon as HEAD reaches a merge commit', () => {
		expect(isHistoryGoalMet({ check: 'history-is-linear' }, twoCommits)).toBe(true);
		expect(isHistoryGoalMet({ check: 'history-is-linear' }, withMerge)).toBe(false);
	});

	it('commit-comes-before follows parent links on HEAD history', () => {
		const goal = {
			check: 'commit-comes-before' as const,
			message: 'Add README',
			later: 'Fix typo'
		};
		expect(isHistoryGoalMet(goal, twoCommits)).toBe(true);
		const reversed = { ...goal, message: 'Fix typo', later: 'Add README' };
		expect(isHistoryGoalMet(reversed, twoCommits)).toBe(false);
	});

	it('config-is-unset passes only when the key is not set locally', () => {
		const goal = { check: 'config-is-unset' as const, key: 'core.editor' };
		const withEditor = snapshotWith({ localConfig: [{ key: 'core.editor', value: 'vim' }] });
		expect(isHistoryGoalMet(goal, snapshotWith({}))).toBe(true);
		expect(isHistoryGoalMet(goal, withEditor)).toBe(false);
	});

	it('latest-commit-is-signed reads the commit HEAD is on', () => {
		const signed = snapshotWith({
			commits: [{ ...sampleCommit(firstId, 'Add README'), isSigned: true }],
			head: { kind: 'branch', branchName: 'main', commitId: firstId }
		});
		expect(isHistoryGoalMet({ check: 'latest-commit-is-signed' }, signed)).toBe(true);
		expect(isHistoryGoalMet({ check: 'latest-commit-is-signed' }, twoCommits)).toBe(false);
	});
});
