/**
 * AreaDesk.svelte.test.ts
 * Component tests for the desk: files show up in the right zone, and a file that just moved
 * gets the brief outline.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
import AreaDesk from './AreaDesk.svelte';

/**
 * Builds a snapshot with one commit and the given file lists.
 * @param changes - the file lists to fill in
 * @returns the snapshot
 */
function snapshotWith(changes: Partial<RepoSnapshot>): RepoSnapshot {
	return {
		commits: [
			{
				id: 'a'.repeat(40),
				message: 'Add README',
				parentIds: [],
				authorName: 'Student',
				authoredAt: '2026-11-25T10:00:00+00:00',
				isReachable: true,
				isSigned: false,
				changedPaths: []
			}
		],
		branches: [],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: 'a'.repeat(40) },
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
		workingFileTexts: [],
		committedFileTexts: [],
		worktrees: [],
		submodules: [],
		sparseSkippedFiles: [],
		...changes
	};
}

describe('AreaDesk', () => {
	it('puts each file in its zone and shows the commits', async () => {
		await render(AreaDesk, {
			snapshot: snapshotWith({
				untrackedFiles: ['notes.txt'],
				stagedFiles: [{ path: 'app.js', changeKind: 'modified', oldPath: null }]
			})
		});

		const workingFolder = page.getByRole('region', { name: 'Working tree' });
		const stagingArea = page.getByRole('region', { name: 'Staging area' });
		const repository = page.getByRole('region', { name: 'Repository' });
		await expect.element(workingFolder.getByText('notes.txt')).toBeVisible();
		await expect.element(stagingArea.getByText('app.js')).toBeVisible();
		await expect.element(repository.getByText('aaaaaaa')).toBeVisible();
		await expect.element(repository.getByText('1 commit')).toBeVisible();
	});

	it('outlines a file that just moved to the staging area', async () => {
		const screen = await render(AreaDesk, {
			snapshot: snapshotWith({ untrackedFiles: ['notes.txt'] })
		});

		await screen.rerender({
			snapshot: snapshotWith({
				stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }]
			})
		});

		const stagedSheet = page.getByRole('region', { name: 'Staging area' }).getByRole('listitem');
		await expect.element(stagedSheet).toHaveAttribute('data-just-moved', 'true');
	});
});
