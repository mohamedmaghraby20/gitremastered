/**
 * HistoryPanel.svelte.test.ts
 * Component tests for the history panel: Expand opens the large map as a dialog, and Esc or
 * Close shuts it and gives focus back to the Expand button. (Following HEAD in a long history
 * is checked in the desktop app: these tests do not load the app's layout styles.)
 */

import '$lib/styles/tokens.css';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Commit, RepoSnapshot } from '$lib/types/repo-snapshot';
import HistoryPanel from './HistoryPanel.svelte';

/**
 * Builds a snapshot with a straight line of commits on main, HEAD on the newest.
 * @param commitCount - how many commits
 * @returns the snapshot
 */
function snapshotWithCommits(commitCount: number): RepoSnapshot {
	const commits: Commit[] = [];
	for (let index = commitCount - 1; index >= 0; index -= 1) {
		commits.push({
			id: String(index).padStart(40, '0'),
			message: `Commit ${index + 1}`,
			parentIds: index === 0 ? [] : [String(index - 1).padStart(40, '0')],
			authorName: 'Student',
			authoredAt: '2026-11-26T10:00:00+00:00'
		});
	}
	const headId = commits[0].id;
	return {
		commits,
		branches: [{ name: 'main', commitId: headId, isRemote: false }],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: headId },
		stagedFiles: [],
		modifiedFiles: [],
		untrackedFiles: [],
		committedFiles: []
	};
}

/**
 * Tells whether the large map's dialog is open. (The test browser's role lookup does not
 * see modal dialogs, so the test reads the dialog's own "open" state.)
 * @returns true while the dialog is open
 */
function isLargeMapOpen(): boolean {
	return (
		document.querySelector('dialog[aria-label="History, large"]')?.hasAttribute('open') ?? false
	);
}

describe('HistoryPanel', () => {
	it('opens the large map with Expand, and closes it with Esc, giving focus back', async () => {
		await render(HistoryPanel, { snapshot: snapshotWithCommits(2) });
		const expandButton = page.getByRole('button', { name: /Expand/ });

		await expandButton.click();
		await expect.poll(isLargeMapOpen).toBe(true);
		await expect.element(page.getByRole('heading', { level: 2, name: 'History' })).toBeVisible();

		await userEvent.keyboard('{Escape}');
		await expect.poll(isLargeMapOpen).toBe(false);
		await expect.element(expandButton).toHaveFocus();
	});

	it('closes the large map with its Close button', async () => {
		await render(HistoryPanel, { snapshot: snapshotWithCommits(2) });

		await page.getByRole('button', { name: /Expand/ }).click();
		await page.getByRole('button', { name: /Close/ }).click();

		await expect.poll(isLargeMapOpen).toBe(false);
	});
});
