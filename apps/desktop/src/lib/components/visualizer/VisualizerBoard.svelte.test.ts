/**
 * VisualizerBoard.svelte.test.ts
 * Component tests for the board's "Files" fold button (it reports the new state, and a folded
 * desk is hidden while the button says so to screen readers) and for the status the board
 * adds: the distance to the upstream branch, a stopped merge, and the stash shelf.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { localBranch, snapshotWith } from '@gitremastered/course-engine/types/snapshot-samples';
import VisualizerBoard from './VisualizerBoard.svelte';

describe('VisualizerBoard', () => {
	it('asks to fold the desk when "Files" is clicked', async () => {
		const onDeskToggle = vi.fn();
		await render(VisualizerBoard, { snapshot: null, caption: null, onDeskToggle });

		const filesButton = page.getByRole('button', { name: /Files/ });
		await expect.element(filesButton).toHaveAttribute('aria-expanded', 'true');
		await filesButton.click();

		expect(onDeskToggle).toHaveBeenCalledWith(true);
	});

	it('hides the desk when folded', async () => {
		await render(VisualizerBoard, { snapshot: null, caption: null, isDeskFolded: true });

		await expect
			.element(page.getByRole('button', { name: /Files/ }))
			.toHaveAttribute('aria-expanded', 'false');
		expect(document.getElementById('files-desk')?.hidden).toBe(true);
	});

	it('says how far the branch is from the branch it follows', async () => {
		const commitId = 'a'.repeat(40);
		const main = { ...localBranch('main', commitId), upstream: 'origin/main', ahead: 2 };
		const snapshot = snapshotWith({
			branches: [main],
			head: { kind: 'branch', branchName: 'main', commitId }
		});
		await render(VisualizerBoard, { snapshot, caption: null });

		await expect.element(page.getByText('on branch main · 2 ahead of origin/main')).toBeVisible();
	});

	it('shows a banner and a marked sheet while a merge is stopped on a conflict', async () => {
		const snapshot = snapshotWith({
			operation: 'merge',
			conflictedFiles: ['app.js'],
			modifiedFiles: [{ path: 'app.js', changeKind: 'modified', oldPath: null }]
		});
		await render(VisualizerBoard, { snapshot, caption: null });

		const banner = page.getByTestId('operation-banner');
		await expect.element(banner.getByText('Merge stopped: 1 file has a conflict')).toBeVisible();
		await expect.element(banner.getByText(/git merge --abort/)).toBeVisible();
		await expect.element(page.getByText('conflict', { exact: true })).toBeVisible();
	});

	it('lists stashed work on the stash shelf', async () => {
		const snapshot = snapshotWith({
			stashes: ['WIP on main: a1b2c3d Add login', 'On main: half a form', 'On main: old idea']
		});
		await render(VisualizerBoard, { snapshot, caption: null });

		const shelf = page.getByRole('region', { name: 'Stash' });
		await expect.element(shelf.getByText('Stash · 3')).toBeVisible();
		await expect.element(shelf.getByText('WIP on main: a1b2c3d Add login')).toBeVisible();
		await expect.element(shelf.getByText('+1 more')).toBeVisible();
	});
});
