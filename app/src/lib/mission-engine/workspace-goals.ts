/**
 * workspace-goals.ts
 * Goal checks about other folders tied to the repository: linked worktrees (another branch
 * checked out in its own folder) and submodules (another repository kept inside this one).
 * Pure functions on a snapshot.
 */

import type { WorkspaceGoalCheck } from '$lib/types/mission';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Checks one workspace goal.
 * @param goalCheck - a goal like { check: "worktree-exists", branch: "hotfix" }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isWorkspaceGoalMet(goalCheck: WorkspaceGoalCheck, snapshot: RepoSnapshot): boolean {
	switch (goalCheck.check) {
		case 'worktree-exists':
			return snapshot.worktrees.some((worktree) => worktree.branch === goalCheck.branch);
		case 'worktree-count-is':
			return snapshot.worktrees.length === goalCheck.count;
		case 'submodule-exists':
			return snapshot.submodules.some(
				(submodule) => submodule.path === goalCheck.path && submodule.isInitialized
			);
	}
}
