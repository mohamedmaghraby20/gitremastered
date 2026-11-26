/**
 * github-goals.test.ts
 * Tests for the goal checks about the practice repository on GitHub. Each check gets a state
 * that meets it and one that does not; things from an earlier attempt never count.
 */

import { describe, expect, it } from 'vitest';
import type { GitHubContext, GitHubState, PullRequest } from '$lib/types/github';
import { isGitHubGoalMet } from './github-goals';

const startedAt = '2026-11-27T10:00:00Z';
const duringAttempt = '2026-11-27T10:05:00Z';
const beforeAttempt = '2026-11-27T09:00:00Z';

/** A merged pull request for the branch "menu", opened during the attempt. */
const mergedMenu: PullRequest = {
	number: 3,
	title: 'Add the menu',
	state: 'merged',
	headBranch: 'menu',
	baseBranch: 'main',
	createdAt: duringAttempt,
	commentCount: 1,
	reviewCount: 0
};

/**
 * Builds a context from an empty repository plus the given fields.
 * @param changes - the state fields to fill in
 * @returns the context
 */
function contextWith(changes: Partial<GitHubState>): GitHubContext {
	const state: GitHubState = {
		repo: 'octo/gitremastered-practice-flow',
		defaultBranch: 'main',
		branches: ['main'],
		pullRequests: [],
		issues: [],
		releases: [],
		defaultBranchRules: [],
		workflowRuns: [],
		...changes
	};
	return { state, startedAt };
}

describe('isGitHubGoalMet', () => {
	it('is never met before GitHub was read', () => {
		expect(isGitHubGoalMet({ check: 'github-branch-exists', branch: 'main' }, null)).toBe(false);
	});

	it('branch checks read the branches on GitHub', () => {
		const context = contextWith({ branches: ['main', 'menu'] });
		expect(isGitHubGoalMet({ check: 'github-branch-exists', branch: 'menu' }, context)).toBe(true);
		expect(isGitHubGoalMet({ check: 'github-branch-is-missing', branch: 'menu' }, context)).toBe(
			false
		);
	});

	it('pull request checks find the pull request by its branch, from this attempt only', () => {
		const merged = { check: 'github-pull-request-is-merged' as const, head: 'menu' };
		expect(isGitHubGoalMet(merged, contextWith({ pullRequests: [mergedMenu] }))).toBe(true);
		const oldAttempt = contextWith({ pullRequests: [{ ...mergedMenu, createdAt: beforeAttempt }] });
		expect(isGitHubGoalMet(merged, oldAttempt)).toBe(false);
		const comment = { check: 'github-pull-request-has-comment' as const, head: 'menu' };
		expect(isGitHubGoalMet(comment, contextWith({ pullRequests: [mergedMenu] }))).toBe(true);
		const review = { check: 'github-pull-request-has-review' as const, head: 'menu' };
		expect(isGitHubGoalMet(review, contextWith({ pullRequests: [mergedMenu] }))).toBe(false);
	});

	it('issue checks match text in the title and the label', () => {
		const issue = {
			number: 4,
			title: 'Typo on the menu',
			state: 'closed' as const,
			createdAt: duringAttempt,
			labels: ['bug']
		};
		const context = contextWith({ issues: [issue] });
		expect(isGitHubGoalMet({ check: 'github-issue-is-closed', title: 'typo' }, context)).toBe(true);
		const label = { check: 'github-issue-has-label' as const, title: 'typo', label: 'docs' };
		expect(isGitHubGoalMet(label, context)).toBe(false);
	});

	it('release, rule and workflow checks', () => {
		const context = contextWith({
			releases: [{ tagName: 'v1.0', name: 'First', isDraft: false, isPrerelease: false }],
			defaultBranchRules: ['pull_request'],
			workflowRuns: [
				{
					name: 'CI',
					headBranch: 'main',
					status: 'completed',
					conclusion: 'success',
					createdAt: duringAttempt
				}
			]
		});
		expect(isGitHubGoalMet({ check: 'github-release-exists', tag: 'v1.0' }, context)).toBe(true);
		expect(
			isGitHubGoalMet({ check: 'github-default-branch-has-rule', rule: 'pull_request' }, context)
		).toBe(true);
		expect(isGitHubGoalMet({ check: 'github-workflow-succeeded', workflow: 'CI' }, context)).toBe(
			true
		);
		expect(isGitHubGoalMet({ check: 'github-workflow-failed', workflow: 'CI' }, context)).toBe(
			false
		);
	});
});
