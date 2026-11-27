/**
 * github-watch.test.ts
 * Tests for the GitHub watcher's timing rules (assumption A6): local changes cause at most
 * one read per 10 seconds, and reading repeats every 20 seconds only while a goal is open.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitHubState } from '$lib/types/github';
import { GitHubWatch } from './github-watch.svelte';

/** An empty repository state. */
const emptyState: GitHubState = {
	repo: 'octo/gitremastered-practice-flow',
	defaultBranch: 'main',
	branches: ['main'],
	pullRequests: [],
	issues: [],
	releases: [],
	defaultBranchRules: [],
	workflowRuns: []
};

describe('GitHubWatch', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('reads right away and keeps the challenge start with the state', async () => {
		const readState = vi.fn(() => Promise.resolve(emptyState));
		const watch = new GitHubWatch(
			'gitremastered-practice-flow',
			'2026-11-27T10:00:00Z',
			readState,
			() => Date.now()
		);

		await watch.readNow();

		expect(readState).toHaveBeenCalledWith('gitremastered-practice-flow');
		expect(watch.context?.startedAt).toBe('2026-11-27T10:00:00Z');
		expect(watch.problem).toBeNull();
	});

	it('turns many local changes into one read, 10 seconds after the last read', async () => {
		const readState = vi.fn(() => Promise.resolve(emptyState));
		const watch = new GitHubWatch(
			'gitremastered-practice-flow',
			'2026-11-27T10:00:00Z',
			readState,
			() => Date.now()
		);
		await watch.readNow();

		watch.noticeLocalChange();
		watch.noticeLocalChange();
		watch.noticeLocalChange();
		await vi.advanceTimersByTimeAsync(9_000);
		expect(readState).toHaveBeenCalledTimes(1);
		await vi.advanceTimersByTimeAsync(1_000);
		expect(readState).toHaveBeenCalledTimes(2);
	});

	it('repeats only while a goal is open', async () => {
		const readState = vi.fn(() => Promise.resolve(emptyState));
		const watch = new GitHubWatch(
			'gitremastered-practice-flow',
			'2026-11-27T10:00:00Z',
			readState,
			() => Date.now()
		);

		watch.keepReadingWhile(true);
		await vi.advanceTimersByTimeAsync(40_000);
		expect(readState).toHaveBeenCalledTimes(2);
		watch.keepReadingWhile(false);
		await vi.advanceTimersByTimeAsync(40_000);
		expect(readState).toHaveBeenCalledTimes(2);
	});

	it('shows a failed read as a problem', async () => {
		const readState = vi.fn(() =>
			Promise.reject(new Error('GitHub did not answer within 15 seconds'))
		);
		const watch = new GitHubWatch(
			'gitremastered-practice-flow',
			'2026-11-27T10:00:00Z',
			readState,
			() => Date.now()
		);

		await watch.readNow();

		expect(watch.problem).toContain('15 seconds');
		expect(watch.context).toBeNull();
	});

	it('never starts a read while another one runs', async () => {
		let finishRead: (state: GitHubState) => void = () => {};
		const readState = vi.fn(() => new Promise<GitHubState>((resolve) => (finishRead = resolve)));
		const watch = new GitHubWatch(
			'gitremastered-practice-flow',
			'2026-11-27T10:00:00Z',
			readState,
			() => Date.now()
		);

		const firstRead = watch.readNow();
		void watch.readNow();
		finishRead(emptyState);
		await firstRead;

		expect(readState).toHaveBeenCalledTimes(1);
	});
});
