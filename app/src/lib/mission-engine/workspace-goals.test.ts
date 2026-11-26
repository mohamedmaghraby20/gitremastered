/**
 * workspace-goals.test.ts
 * Tests for the goal checks about linked worktrees and submodules.
 */

import { describe, expect, it } from 'vitest';
import { snapshotWith } from '$lib/types/snapshot-samples';
import { isWorkspaceGoalMet } from './workspace-goals';

describe('isWorkspaceGoalMet', () => {
	it('worktree-exists needs a linked worktree with that branch checked out', () => {
		const goal = { check: 'worktree-exists' as const, branch: 'hotfix' };
		const withHotfix = snapshotWith({ worktrees: [{ path: '/work/hotfix', branch: 'hotfix' }] });
		const detached = snapshotWith({ worktrees: [{ path: '/work/hotfix', branch: null }] });
		expect(isWorkspaceGoalMet(goal, withHotfix)).toBe(true);
		expect(isWorkspaceGoalMet(goal, detached)).toBe(false);
	});

	it('submodule-exists needs the submodule listed and its files checked out', () => {
		const goal = { check: 'submodule-exists' as const, path: 'vendor/library' };
		const ready = snapshotWith({ submodules: [{ path: 'vendor/library', isInitialized: true }] });
		const empty = snapshotWith({ submodules: [{ path: 'vendor/library', isInitialized: false }] });
		expect(isWorkspaceGoalMet(goal, ready)).toBe(true);
		expect(isWorkspaceGoalMet(goal, empty)).toBe(false);
	});
});
