/**
 * work-state.test.ts
 * Tests for the words about an operation in progress and the distance to the upstream branch.
 */

import { describe, expect, it } from 'vitest';
import { localBranch, snapshotWith } from '@gitremastered/course-engine/types/snapshot-samples';
import { describeOperation, describeUpstream } from './work-state';

describe('describeOperation', () => {
	it('says nothing while Git is idle', () => {
		expect(describeOperation(snapshotWith({}))).toBeNull();
	});

	it('names the conflicted files and the way out of a stopped merge', () => {
		const stopped = snapshotWith({ operation: 'merge', conflictedFiles: ['app.js'] });
		expect(describeOperation(stopped)).toEqual({
			title: 'Merge stopped: 1 file has a conflict',
			nextStep: 'Fix each file, git add it, then git commit. To give up: git merge --abort.'
		});
	});

	it('says how to finish once every conflict is fixed', () => {
		const resolved = snapshotWith({ operation: 'revert' });
		expect(describeOperation(resolved)).toEqual({
			title: 'Revert in progress',
			nextStep: 'Finish with git revert --continue. To give up: git revert --abort.'
		});
	});
});

describe('describeUpstream', () => {
	const commitId = 'a'.repeat(40);
	const head = { kind: 'branch' as const, branchName: 'main', commitId };

	/**
	 * Builds a snapshot whose main branch follows origin/main at a given distance.
	 * @param ahead - commits only main has
	 * @param behind - commits only origin/main has
	 * @returns the snapshot
	 */
	function mainAt(ahead: number, behind: number) {
		const main = { ...localBranch('main', commitId), upstream: 'origin/main', ahead, behind };
		return snapshotWith({ branches: [main], head });
	}

	it('describes level, ahead, behind and both', () => {
		expect(describeUpstream(mainAt(0, 0))).toBe('level with origin/main');
		expect(describeUpstream(mainAt(2, 0))).toBe('2 ahead of origin/main');
		expect(describeUpstream(mainAt(0, 3))).toBe('3 behind origin/main');
		expect(describeUpstream(mainAt(1, 3))).toBe('1 ahead, 3 behind origin/main');
	});

	it('says nothing without an upstream or with a detached HEAD', () => {
		const alone = snapshotWith({ branches: [localBranch('main', commitId)], head });
		expect(describeUpstream(alone)).toBeNull();
		const detached = { ...mainAt(1, 0), head: { kind: 'detached' as const, commitId } };
		expect(describeUpstream(detached)).toBeNull();
	});
});
