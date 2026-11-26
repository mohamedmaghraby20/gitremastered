/**
 * github-goals.ts
 * Goal checks about the practice repository on GitHub: branches, pull requests, issues,
 * releases, rules and Actions runs. They read a GitHubContext (the state plus when the
 * challenge started), which the mission panel fetches now and then (assumption A6), never
 * the local snapshot. Pure functions.
 */

import type { GitHubGoalCheck } from '$lib/types/mission';
import type { GitHubContext, Issue, PullRequest } from '$lib/types/github';

/**
 * Checks one GitHub goal.
 * @param goalCheck - a goal like { check: "github-pull-request-is-merged", head: "menu" }
 * @param context - the repository's state and the challenge's start (null before the first read)
 * @returns true if the goal is met
 */
export function isGitHubGoalMet(
	goalCheck: GitHubGoalCheck,
	context: GitHubContext | null
): boolean {
	if (context === null) {
		return false;
	}
	const { state } = context;
	switch (goalCheck.check) {
		case 'github-branch-exists':
			return state.branches.includes(goalCheck.branch);
		case 'github-branch-is-missing':
			return !state.branches.includes(goalCheck.branch);
		case 'github-pull-request-is-open':
			return hasPullRequest(context, goalCheck.head, (pull) => pull.state === 'open');
		case 'github-pull-request-is-merged':
			return hasPullRequest(context, goalCheck.head, (pull) => pull.state === 'merged');
		case 'github-pull-request-is-closed':
			return hasPullRequest(context, goalCheck.head, (pull) => pull.state === 'closed');
		case 'github-pull-request-has-comment':
			return hasPullRequest(context, goalCheck.head, (pull) => pull.commentCount > 0);
		case 'github-pull-request-has-review':
			return hasPullRequest(context, goalCheck.head, (pull) => pull.reviewCount > 0);
		case 'github-issue-exists':
			return hasIssue(context, goalCheck.title, () => true);
		case 'github-issue-is-closed':
			return hasIssue(context, goalCheck.title, (issue) => issue.state === 'closed');
		case 'github-issue-has-label':
			return hasIssue(context, goalCheck.title, (issue) => issue.labels.includes(goalCheck.label));
		case 'github-release-exists':
			return state.releases.some(
				(release) => release.tagName === goalCheck.tag && !release.isDraft
			);
		case 'github-default-branch-has-rule':
			return state.defaultBranchRules.includes(goalCheck.rule);
		case 'github-workflow-succeeded':
			return hasWorkflowRun(context, goalCheck.workflow, 'success');
		case 'github-workflow-failed':
			return hasWorkflowRun(context, goalCheck.workflow, 'failure');
	}
}

/**
 * Tells whether a time is at or after the challenge's start.
 * @param time - an ISO 8601 time from GitHub
 * @param context - holds the start
 * @returns true for something made during this attempt
 */
function isFromThisAttempt(time: string, context: GitHubContext): boolean {
	return Date.parse(time) >= Date.parse(context.startedAt);
}

/**
 * Tells whether a pull request from this attempt, for a branch, matches a test.
 * @param context - the state and the start
 * @param head - the pull request's branch
 * @param matches - the test
 * @returns true if one matches
 */
function hasPullRequest(
	context: GitHubContext,
	head: string,
	matches: (pull: PullRequest) => boolean
): boolean {
	return context.state.pullRequests.some(
		(pull) =>
			pull.headBranch === head && isFromThisAttempt(pull.createdAt, context) && matches(pull)
	);
}

/**
 * Tells whether an issue from this attempt, with text in its title, matches a test.
 * @param context - the state and the start
 * @param titleText - text in the title, any letter case
 * @param matches - the test
 * @returns true if one matches
 */
function hasIssue(
	context: GitHubContext,
	titleText: string,
	matches: (issue: Issue) => boolean
): boolean {
	const wantedText = titleText.toLowerCase();
	return context.state.issues.some(
		(issue) =>
			issue.title.toLowerCase().includes(wantedText) &&
			isFromThisAttempt(issue.createdAt, context) &&
			matches(issue)
	);
}

/**
 * Tells whether a workflow ran during this attempt and finished with a conclusion.
 * @param context - the state and the start
 * @param workflowName - the workflow's name (its `name:` line)
 * @param conclusion - "success" or "failure"
 * @returns true if such a run exists
 */
function hasWorkflowRun(context: GitHubContext, workflowName: string, conclusion: string): boolean {
	return context.state.workflowRuns.some(
		(run) =>
			run.name === workflowName &&
			run.conclusion === conclusion &&
			isFromThisAttempt(run.createdAt, context)
	);
}
