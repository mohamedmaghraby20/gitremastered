/**
 * mission.ts
 * The shape of a lesson's mission, read from mission.yaml (SPEC.md section 4).
 */

/**
 * One goal the student must reach, checked against the repo snapshot.
 * "check" names the kind of test; the other fields depend on it.
 */
export type GoalCheck =
	| { check: 'file-is-untracked'; file: string }
	| { check: 'file-is-modified'; file: string }
	| { check: 'file-is-staged'; file: string }
	| { check: 'file-is-committed'; file: string }
	| { check: 'commit-count-at-least'; count: number }
	| { check: 'working-folder-clean' };

/** The names of every kind of goal check, used to reject unknown ones. */
export const goalCheckKinds = [
	'file-is-untracked',
	'file-is-modified',
	'file-is-staged',
	'file-is-committed',
	'commit-count-at-least',
	'working-folder-clean'
] as const;

/** A goal check plus the sentence shown in the mission checklist. */
export type MissionGoal = GoalCheck & { label: string };

/** A complete mission: how to set it up, what to reach, how to help. */
export type Mission = {
	brief: string; // what the student is asked to do, in one or two sentences
	setup: string[]; // shell commands that build the practice repo, run in order
	goals: MissionGoal[];
	hints: string[]; // from a gentle nudge to the full answer
	solution: string[]; // shell commands that reach every goal (used by mission tests)
};
