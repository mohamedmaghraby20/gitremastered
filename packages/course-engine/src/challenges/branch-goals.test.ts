/**
 * branch-goals.test.ts
 * Tests for the goal checks about branches and where HEAD is.
 */

import { describe, expect, it } from 'vitest';
import {
	localBranch,
	remoteBranch,
	sampleCommit,
	snapshotWith
} from '../types/snapshot-samples.ts';
import { isBranchGoalMet } from './branch-goals.ts';

const firstId = 'a'.repeat(40);
const mainId = 'b'.repeat(40);
const featureId = 'c'.repeat(40);

/**
 * main: "Add README" then "Update README". feature forked from the first commit with
 * "Add login". origin/main is still on the first commit. HEAD is on main.
 */
const forked = snapshotWith({
	commits: [
		sampleCommit(featureId, 'Add login', [firstId]),
		sampleCommit(mainId, 'Update README', [firstId]),
		sampleCommit(firstId, 'Add README')
	],
	branches: [
		localBranch('main', mainId),
		localBranch('feature', featureId),
		remoteBranch('origin/main', firstId)
	],
	head: { kind: 'branch', branchName: 'main', commitId: mainId }
});

describe('isBranchGoalMet', () => {
	it('branch-exists and branch-is-missing look at local branches only', () => {
		expect(isBranchGoalMet({ check: 'branch-exists', branch: 'feature' }, forked)).toBe(true);
		expect(isBranchGoalMet({ check: 'branch-exists', branch: 'origin/main' }, forked)).toBe(false);
		expect(isBranchGoalMet({ check: 'branch-is-missing', branch: 'hotfix' }, forked)).toBe(true);
		expect(isBranchGoalMet({ check: 'branch-is-missing', branch: 'feature' }, forked)).toBe(false);
	});

	it('branch-exists counts the branch of a repository with no commits yet', () => {
		const unborn = snapshotWith({ head: { kind: 'branch', branchName: 'trunk', commitId: null } });
		expect(isBranchGoalMet({ check: 'branch-exists', branch: 'trunk' }, unborn)).toBe(true);
	});

	it('head-is-on-branch and head-is-detached', () => {
		const detached = { ...forked, head: { kind: 'detached' as const, commitId: firstId } };
		expect(isBranchGoalMet({ check: 'head-is-on-branch', branch: 'main' }, forked)).toBe(true);
		expect(isBranchGoalMet({ check: 'head-is-on-branch', branch: 'feature' }, forked)).toBe(false);
		expect(isBranchGoalMet({ check: 'head-is-on-branch', branch: 'main' }, detached)).toBe(false);
		expect(isBranchGoalMet({ check: 'head-is-detached' }, detached)).toBe(true);
		expect(isBranchGoalMet({ check: 'head-is-detached' }, forked)).toBe(false);
	});

	it('branch-is-merged-into follows the history of the target branch', () => {
		const goal = { check: 'branch-is-merged-into' as const, branch: 'feature', into: 'main' };
		expect(isBranchGoalMet(goal, forked)).toBe(false);

		const mergeId = 'd'.repeat(40);
		const merged = snapshotWith({
			commits: [sampleCommit(mergeId, 'Merge feature', [mainId, featureId]), ...forked.commits],
			branches: [localBranch('main', mergeId), localBranch('feature', featureId)]
		});
		expect(isBranchGoalMet(goal, merged)).toBe(true);
		expect(isBranchGoalMet({ ...goal, branch: 'gone' }, merged)).toBe(false);
	});

	it('branch-contains-commit and branch-lacks-commit read one branch, local or remote', () => {
		const contains = { check: 'branch-contains-commit' as const, message: 'Add login' };
		const lacks = { check: 'branch-lacks-commit' as const, message: 'Add login' };
		expect(isBranchGoalMet({ ...contains, branch: 'feature' }, forked)).toBe(true);
		expect(isBranchGoalMet({ ...contains, branch: 'main' }, forked)).toBe(false);
		expect(isBranchGoalMet({ ...lacks, branch: 'main' }, forked)).toBe(true);
		expect(isBranchGoalMet({ ...lacks, branch: 'origin/main' }, forked)).toBe(true);
		expect(isBranchGoalMet({ ...lacks, branch: 'feature' }, forked)).toBe(false);
	});

	it('a missing branch neither contains nor lacks a commit', () => {
		const contains = { check: 'branch-contains-commit' as const, message: 'Add login' };
		const lacks = { check: 'branch-lacks-commit' as const, message: 'Add login' };
		expect(isBranchGoalMet({ ...contains, branch: 'gone' }, forked)).toBe(false);
		expect(isBranchGoalMet({ ...lacks, branch: 'gone' }, forked)).toBe(false);
	});

	it('branch-is-at-commit reads the newest commit of the branch', () => {
		const goal = {
			check: 'branch-is-at-commit' as const,
			branch: 'main',
			message: 'Update README'
		};
		expect(isBranchGoalMet(goal, forked)).toBe(true);
		expect(isBranchGoalMet({ ...goal, message: 'Add README' }, forked)).toBe(false);
		expect(isBranchGoalMet({ ...goal, branch: 'gone' }, forked)).toBe(false);
	});
});
