/**
 * goal-checker.ts
 * Decides whether a mission's goals are reached, by reading the current repo snapshot.
 * This file only sorts each goal to the file that knows its topic:
 *   file-goals.ts     one file's place among the three areas
 *   history-goals.ts  commits on HEAD's history, work in progress, settings, answers
 *   branch-goals.ts   branches and where HEAD is
 *   remote-goals.ts   remotes, upstreams and tags
 * Everything is a pure function: no screen code, no Git, so every goal kind is tested with
 * sample snapshots.
 */

import type { GoalCheck } from '$lib/types/mission';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { isBranchGoalMet } from './branch-goals';
import { isFileGoalMet } from './file-goals';
import { isHistoryGoalMet } from './history-goals';
import { isRemoteGoalMet } from './remote-goals';

/**
 * Checks one goal against the repo snapshot.
 * @param goalCheck - the goal from challenges.yaml, e.g. { check: "file-is-committed", file: "notes.txt" }
 * @param repoSnapshot - the repo state right now (null before the first snapshot arrives)
 * @returns true if the goal is met
 */
export function isGoalMet(goalCheck: GoalCheck, repoSnapshot: RepoSnapshot | null): boolean {
	if (repoSnapshot === null) {
		return false;
	}
	switch (goalCheck.check) {
		case 'file-is-untracked':
		case 'file-is-modified':
		case 'file-is-staged':
		case 'file-is-committed':
		case 'file-is-not-committed':
		case 'file-exists':
		case 'file-is-missing':
		case 'working-folder-clean':
			return isFileGoalMet(goalCheck, repoSnapshot);
		case 'commit-count-at-least':
		case 'commit-count-is':
		case 'latest-commit-message-contains':
		case 'commit-exists':
		case 'commit-is-gone':
		case 'head-commit-is-merge':
		case 'no-operation-in-progress':
		case 'stash-count-is':
		case 'config-is':
		case 'answer-is':
		case 'answer-is-commit':
			return isHistoryGoalMet(goalCheck, repoSnapshot);
		case 'branch-exists':
		case 'branch-is-missing':
		case 'head-is-on-branch':
		case 'head-is-detached':
		case 'branch-is-merged-into':
		case 'branch-contains-commit':
		case 'branch-lacks-commit':
		case 'branch-is-at-commit':
			return isBranchGoalMet(goalCheck, repoSnapshot);
		case 'remote-exists':
		case 'branch-tracks':
		case 'branch-is-in-sync':
		case 'remote-branch-exists':
		case 'remote-branch-is-missing':
		case 'tag-exists':
		case 'tag-is-missing':
		case 'tag-is-annotated':
		case 'tag-is-on-commit':
		case 'remote-has-tag':
			return isRemoteGoalMet(goalCheck, repoSnapshot);
	}
}

/**
 * Checks every goal of a mission.
 * @param goalChecks - the mission's goals, in order
 * @param repoSnapshot - the repo state right now
 * @returns one true/false per goal, in the same order
 */
export function checkGoals(goalChecks: GoalCheck[], repoSnapshot: RepoSnapshot | null): boolean[] {
	return goalChecks.map((goalCheck) => isGoalMet(goalCheck, repoSnapshot));
}
