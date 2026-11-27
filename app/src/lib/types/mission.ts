/**
 * mission.ts
 * The shape of a lesson's challenges, read from challenges.yaml (SPEC.md section 4): each
 * challenge is a mission (brief, setup, goals, hints, solution) with an ID, a title and a level.
 * docs/writing-lessons.md explains every goal check to lesson authors.
 */

import type { GitHubChallenge } from './github.ts';

/** Goals about one file in the working tree, the staging area or the latest commit. */
export type FileGoalCheck =
	| { check: 'file-is-untracked'; file: string }
	| { check: 'file-is-modified'; file: string }
	| { check: 'file-is-staged'; file: string }
	| { check: 'file-is-committed'; file: string }
	| { check: 'file-is-not-committed'; file: string }
	| { check: 'file-exists'; file: string }
	| { check: 'file-is-missing'; file: string }
	| { check: 'working-folder-clean' };

/** Goals about what a file says, in the working tree or in the latest commit, and its whole history. */
export type ContentGoalCheck =
	| { check: 'file-contains'; file: string; text: string }
	| { check: 'file-lacks'; file: string; text: string }
	| { check: 'committed-file-contains'; file: string; text: string }
	| { check: 'committed-file-lacks'; file: string; text: string }
	| { check: 'file-is-in-no-commit'; file: string };

/** Goals about the history HEAD is on, settings, and written answers. */
export type HistoryGoalCheck =
	| { check: 'commit-count-at-least'; count: number }
	| { check: 'commit-count-is'; count: number }
	| { check: 'latest-commit-message-contains'; text: string }
	| { check: 'commit-exists'; message: string }
	| { check: 'commit-is-gone'; message: string }
	| { check: 'head-commit-is-merge' }
	| { check: 'no-operation-in-progress' }
	| { check: 'stash-count-is'; count: number }
	| { check: 'config-is'; key: string; value: string }
	| { check: 'answer-is'; answer: string }
	| { check: 'answer-is-commit'; message: string }
	| { check: 'history-is-linear' }
	| { check: 'commit-comes-before'; message: string; later: string }
	| { check: 'config-is-unset'; key: string }
	| { check: 'latest-commit-is-signed' };

/** Goals about branches and where HEAD is. */
export type BranchGoalCheck =
	| { check: 'branch-exists'; branch: string }
	| { check: 'branch-is-missing'; branch: string }
	| { check: 'head-is-on-branch'; branch: string }
	| { check: 'head-is-detached' }
	| { check: 'branch-is-merged-into'; branch: string; into: string }
	| { check: 'branch-contains-commit'; branch: string; message: string }
	| { check: 'branch-lacks-commit'; branch: string; message: string }
	| { check: 'branch-is-at-commit'; branch: string; message: string };

/** Goals about remotes, remote-tracking branches and tags. */
export type RemoteGoalCheck =
	| { check: 'remote-exists'; remote: string }
	| { check: 'branch-tracks'; branch: string; upstream: string }
	| { check: 'branch-is-in-sync'; branch: string }
	| { check: 'remote-branch-exists'; branch: string }
	| { check: 'remote-branch-is-missing'; branch: string }
	| { check: 'tag-exists'; tag: string }
	| { check: 'tag-is-missing'; tag: string }
	| { check: 'tag-is-annotated'; tag: string }
	| { check: 'tag-is-on-commit'; tag: string; message: string }
	| { check: 'remote-has-tag'; tag: string };

/**
 * Goals about the practice repository on GitHub (wave B). Pull requests, issues and workflow
 * runs count only when made after the challenge started. A pull request is named by its
 * branch (head); an issue by text in its title.
 */
export type GitHubGoalCheck =
	| { check: 'github-branch-exists'; branch: string }
	| { check: 'github-branch-is-missing'; branch: string }
	| { check: 'github-pull-request-is-open'; head: string }
	| { check: 'github-pull-request-is-merged'; head: string }
	| { check: 'github-pull-request-is-closed'; head: string }
	| { check: 'github-pull-request-has-comment'; head: string }
	| { check: 'github-pull-request-has-review'; head: string }
	| { check: 'github-issue-exists'; title: string }
	| { check: 'github-issue-is-closed'; title: string }
	| { check: 'github-issue-has-label'; title: string; label: string }
	| { check: 'github-release-exists'; tag: string }
	| { check: 'github-default-branch-has-rule'; rule: string }
	| { check: 'github-workflow-succeeded'; workflow: string }
	| { check: 'github-workflow-failed'; workflow: string };

/** Goals about other folders that share or hold the repository: worktrees and submodules. */
export type WorkspaceGoalCheck =
	| { check: 'worktree-exists'; branch: string }
	| { check: 'worktree-count-is'; count: number }
	| { check: 'submodule-exists'; path: string };

/**
 * One goal the student must reach, checked against the repo snapshot.
 * "check" names the kind of test; the other fields depend on it.
 */
export type GoalCheck =
	| FileGoalCheck
	| ContentGoalCheck
	| HistoryGoalCheck
	| BranchGoalCheck
	| RemoteGoalCheck
	| WorkspaceGoalCheck
	| GitHubGoalCheck;

/** The name of a goal check, like "file-is-committed". */
export type GoalCheckKind = GoalCheck['check'];

/**
 * The extra fields each kind of goal check needs in challenges.yaml. "count" is a whole
 * number; every other field is text. The challenge parser reads goals from this table, so a
 * new check is added here and in the union above.
 */
export const goalCheckFields: Record<GoalCheckKind, readonly string[]> = {
	'file-is-untracked': ['file'],
	'file-is-modified': ['file'],
	'file-is-staged': ['file'],
	'file-is-committed': ['file'],
	'file-is-not-committed': ['file'],
	'file-exists': ['file'],
	'file-is-missing': ['file'],
	'working-folder-clean': [],
	'file-contains': ['file', 'text'],
	'file-lacks': ['file', 'text'],
	'committed-file-contains': ['file', 'text'],
	'committed-file-lacks': ['file', 'text'],
	'file-is-in-no-commit': ['file'],
	'commit-count-at-least': ['count'],
	'commit-count-is': ['count'],
	'latest-commit-message-contains': ['text'],
	'commit-exists': ['message'],
	'commit-is-gone': ['message'],
	'head-commit-is-merge': [],
	'no-operation-in-progress': [],
	'stash-count-is': ['count'],
	'config-is': ['key', 'value'],
	'answer-is': ['answer'],
	'answer-is-commit': ['message'],
	'history-is-linear': [],
	'commit-comes-before': ['message', 'later'],
	'config-is-unset': ['key'],
	'latest-commit-is-signed': [],
	'branch-exists': ['branch'],
	'branch-is-missing': ['branch'],
	'head-is-on-branch': ['branch'],
	'head-is-detached': [],
	'branch-is-merged-into': ['branch', 'into'],
	'branch-contains-commit': ['branch', 'message'],
	'branch-lacks-commit': ['branch', 'message'],
	'branch-is-at-commit': ['branch', 'message'],
	'remote-exists': ['remote'],
	'branch-tracks': ['branch', 'upstream'],
	'branch-is-in-sync': ['branch'],
	'remote-branch-exists': ['branch'],
	'remote-branch-is-missing': ['branch'],
	'tag-exists': ['tag'],
	'tag-is-missing': ['tag'],
	'tag-is-annotated': ['tag'],
	'tag-is-on-commit': ['tag', 'message'],
	'remote-has-tag': ['tag'],
	'worktree-exists': ['branch'],
	'worktree-count-is': ['count'],
	'submodule-exists': ['path'],
	'github-branch-exists': ['branch'],
	'github-branch-is-missing': ['branch'],
	'github-pull-request-is-open': ['head'],
	'github-pull-request-is-merged': ['head'],
	'github-pull-request-is-closed': ['head'],
	'github-pull-request-has-comment': ['head'],
	'github-pull-request-has-review': ['head'],
	'github-issue-exists': ['title'],
	'github-issue-is-closed': ['title'],
	'github-issue-has-label': ['title', 'label'],
	'github-release-exists': ['tag'],
	'github-default-branch-has-rule': ['rule'],
	'github-workflow-succeeded': ['workflow'],
	'github-workflow-failed': ['workflow']
};

/** The names of every kind of goal check, used to reject unknown ones. */
export const goalCheckKinds = Object.keys(goalCheckFields) as GoalCheckKind[];

/** A goal check plus the sentence shown in the mission checklist. */
export type MissionGoal = GoalCheck & { label: string };

/** A complete mission: how to set it up, what to reach, how to help. */
export type Mission = {
	brief: string; // what the student is asked to do, in one or two sentences
	setup: string[]; // shell commands that build the practice repo, run in order
	goals: MissionGoal[];
	hints: string[]; // from a gentle nudge to the full answer
	solution: string[]; // shell commands that reach every goal (used by mission tests)
	github: GitHubChallenge | null; // a GitHub challenge's practice repository and teammate steps
};

/** The three levels, from easy to hard; a lesson lists its challenges in this order. */
export const challengeLevels = ['easy', 'medium', 'hard'] as const;

/** How hard a challenge is. */
export type ChallengeLevel = (typeof challengeLevels)[number];

/** One challenge: a mission with an ID (unique in its lesson), a short title and a level. */
export type Challenge = Mission & {
	id: string; // e.g. "release-notes"
	title: string; // e.g. "Save the release notes on their own"
	level: ChallengeLevel;
};

/**
 * Tells whether a goal reads GitHub (one of the `github-…` checks) rather than the snapshot.
 * @param goalCheck - any goal
 * @returns true for a GitHub goal, and narrows its type
 */
export function isGitHubGoalCheck(goalCheck: GoalCheck): goalCheck is GitHubGoalCheck {
	return goalCheck.check.startsWith('github-');
}
