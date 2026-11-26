/**
 * remote-goals.test.ts
 * Tests for the goal checks about remotes, upstreams and tags.
 */

import { describe, expect, it } from 'vitest';
import { localBranch, remoteBranch, sampleCommit, snapshotWith } from '$lib/types/snapshot-samples';
import { isRemoteGoalMet } from './remote-goals';

const firstId = 'a'.repeat(40);
const secondId = 'b'.repeat(40);

/**
 * main follows origin/main and is one commit ahead. Tag v1.0 (plain) is on the first commit
 * and exists on origin; tag v2.0 (annotated) is on the second and was not pushed.
 */
const withRemote = snapshotWith({
	commits: [sampleCommit(secondId, 'Add login', [firstId]), sampleCommit(firstId, 'Add README')],
	branches: [
		{ ...localBranch('main', secondId), upstream: 'origin/main', ahead: 1 },
		localBranch('draft', firstId),
		remoteBranch('origin/main', firstId)
	],
	tags: [
		{ name: 'v1.0', commitId: firstId, isAnnotated: false },
		{ name: 'v2.0', commitId: secondId, isAnnotated: true }
	],
	remotes: [{ name: 'origin', url: '../origin.git', tagNames: ['v1.0'] }],
	head: { kind: 'branch', branchName: 'main', commitId: secondId }
});

describe('isRemoteGoalMet', () => {
	it('remote-exists', () => {
		expect(isRemoteGoalMet({ check: 'remote-exists', remote: 'origin' }, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ check: 'remote-exists', remote: 'upstream' }, withRemote)).toBe(false);
	});

	it('branch-tracks', () => {
		const goal = { check: 'branch-tracks' as const, branch: 'main', upstream: 'origin/main' };
		expect(isRemoteGoalMet(goal, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ ...goal, branch: 'draft' }, withRemote)).toBe(false);
	});

	it('branch-is-in-sync needs an upstream with nothing ahead or behind', () => {
		const goal = { check: 'branch-is-in-sync' as const, branch: 'main' };
		expect(isRemoteGoalMet(goal, withRemote)).toBe(false);

		const pushed = snapshotWith({
			branches: [{ ...localBranch('main', secondId), upstream: 'origin/main' }]
		});
		expect(isRemoteGoalMet(goal, pushed)).toBe(true);
		// A branch with no upstream is not "in sync" with anything.
		expect(isRemoteGoalMet({ ...goal, branch: 'draft' }, withRemote)).toBe(false);
	});

	it('remote-branch-exists and remote-branch-is-missing', () => {
		const exists = { check: 'remote-branch-exists' as const, branch: 'origin/main' };
		const missing = { check: 'remote-branch-is-missing' as const, branch: 'origin/draft' };
		expect(isRemoteGoalMet(exists, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ ...exists, branch: 'origin/draft' }, withRemote)).toBe(false);
		expect(isRemoteGoalMet(missing, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ ...missing, branch: 'origin/main' }, withRemote)).toBe(false);
	});

	it('tag-exists, tag-is-missing and tag-is-annotated', () => {
		expect(isRemoteGoalMet({ check: 'tag-exists', tag: 'v1.0' }, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ check: 'tag-exists', tag: 'v3.0' }, withRemote)).toBe(false);
		expect(isRemoteGoalMet({ check: 'tag-is-missing', tag: 'v3.0' }, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ check: 'tag-is-missing', tag: 'v1.0' }, withRemote)).toBe(false);
		expect(isRemoteGoalMet({ check: 'tag-is-annotated', tag: 'v2.0' }, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ check: 'tag-is-annotated', tag: 'v1.0' }, withRemote)).toBe(false);
	});

	it('tag-is-on-commit', () => {
		const goal = { check: 'tag-is-on-commit' as const, tag: 'v1.0', message: 'Add README' };
		expect(isRemoteGoalMet(goal, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ ...goal, message: 'Add login' }, withRemote)).toBe(false);
	});

	it('remote-has-tag reads the tags of the local remote', () => {
		expect(isRemoteGoalMet({ check: 'remote-has-tag', tag: 'v1.0' }, withRemote)).toBe(true);
		expect(isRemoteGoalMet({ check: 'remote-has-tag', tag: 'v2.0' }, withRemote)).toBe(false);
	});
});
