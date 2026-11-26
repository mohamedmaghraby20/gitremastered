/**
 * MissionPanel.svelte.test.ts
 * Component tests for the mission ticket: goals tick from the snapshot, hints reveal one at a
 * time, Check explains, Reset hides the hints again, and completion is reported once.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Mission } from '$lib/types/mission';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import MissionPanel from './MissionPanel.svelte';

const mission: Mission = {
	brief: 'Commit notes.txt.',
	setup: ['git init'],
	goals: [
		{ check: 'file-is-staged', file: 'notes.txt', label: 'notes.txt is staged' },
		{ check: 'commit-count-at-least', count: 1, label: 'The repo has a commit' }
	],
	hints: ['First hint', 'Second hint', 'Third hint'],
	solution: []
};

/**
 * Builds a snapshot with the given changes.
 * @param changes - the fields to fill in
 * @returns the snapshot
 */
function snapshotWith(changes: Partial<RepoSnapshot>): RepoSnapshot {
	return {
		commits: [],
		branches: [],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: null },
		stagedFiles: [],
		modifiedFiles: [],
		untrackedFiles: [],
		committedFiles: [],
		conflictedFiles: [],
		operation: null,
		stashes: [],
		remotes: [],
		localConfig: [],
		answer: null,
		...changes
	};
}

const stagedSnapshot = snapshotWith({
	stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }]
});

describe('MissionPanel', () => {
	it('ticks goals as soon as the snapshot meets them', async () => {
		await render(MissionPanel, {
			mission,
			heading: 'Challenge 1 · Easy',
			snapshot: stagedSnapshot,
			onReset: () => Promise.resolve()
		});

		await expect.element(page.getByText('1 / 2 done')).toBeVisible();
		await expect.element(page.getByText('(done)')).toBeInTheDocument();
		await expect.element(page.getByText('(not done yet)')).toBeInTheDocument();
	});

	it('reveals hints one at a time', async () => {
		await render(MissionPanel, {
			mission,
			heading: 'Challenge 1 · Easy',
			snapshot: null,
			onReset: () => Promise.resolve()
		});

		await page.getByRole('button', { name: 'Show a hint (1 of 3)' }).click();
		await expect.element(page.getByText('First hint')).toBeVisible();
		await expect.element(page.getByText('Second hint')).not.toBeInTheDocument();
		await page.getByRole('button', { name: 'Show a hint (2 of 3)' }).click();
		await expect.element(page.getByText('Second hint')).toBeVisible();
	});

	it('explains what is left when checking', async () => {
		await render(MissionPanel, {
			mission,
			heading: 'Challenge 1 · Easy',
			snapshot: stagedSnapshot,
			onReset: () => Promise.resolve()
		});

		await page.getByRole('button', { name: 'Check challenge' }).click();
		await expect.element(page.getByRole('status').getByText(/1 goal to go/)).toBeVisible();
	});

	it('resets the practice folder and hides the hints again', async () => {
		const onReset = vi.fn(() => Promise.resolve());
		await render(MissionPanel, { mission, heading: 'Challenge 1 · Easy', snapshot: null, onReset });
		await page.getByRole('button', { name: 'Show a hint (1 of 3)' }).click();

		await page.getByRole('button', { name: 'Reset practice' }).click();

		expect(onReset).toHaveBeenCalledOnce();
		await expect.element(page.getByText('First hint')).not.toBeInTheDocument();
	});

	it('reports completion once when every goal is met', async () => {
		const onComplete = vi.fn();
		const doneSnapshot = {
			...stagedSnapshot,
			commits: [
				{
					id: 'a'.repeat(40),
					message: 'Add notes',
					parentIds: [],
					authorName: 'Student',
					authoredAt: '2026-11-25T10:00:00+00:00',
					isReachable: true
				}
			],
			head: { kind: 'branch' as const, branchName: 'main', commitId: 'a'.repeat(40) }
		};
		const screen = await render(MissionPanel, {
			mission,
			heading: 'Challenge 1 · Easy',
			snapshot: doneSnapshot,
			onReset: () => Promise.resolve(),
			onComplete
		});
		await screen.rerender({ snapshot: { ...doneSnapshot } });

		await expect.element(page.getByText('2 / 2 done')).toBeVisible();
		expect(onComplete).toHaveBeenCalledOnce();
	});
});
