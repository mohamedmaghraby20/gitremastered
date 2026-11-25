/**
 * HistoryMap.svelte.test.ts
 * Component test for the history map in a real browser: stations, HEAD and the branch label.
 */

import '$lib/styles/tokens.css';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import HistoryMap from './HistoryMap.svelte';

const firstId = 'a'.repeat(40);
const secondId = 'b'.repeat(40);

const twoCommitSnapshot: RepoSnapshot = {
	commits: [
		{
			id: secondId,
			message: 'Add notes',
			parentIds: [firstId],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:05:00+00:00'
		},
		{
			id: firstId,
			message: 'Add README',
			parentIds: [],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:00:00+00:00'
		}
	],
	branches: [{ name: 'main', commitId: secondId, isRemote: false }],
	tags: [],
	head: { kind: 'branch', branchName: 'main', commitId: secondId },
	stagedFiles: [],
	modifiedFiles: [],
	untrackedFiles: []
};

describe('HistoryMap', () => {
	it('draws a station per commit, the next commit, HEAD and the branch label', async () => {
		document.body.style.height = '400px';
		await render(HistoryMap, { snapshot: twoCommitSnapshot });

		await expect.element(page.getByText('aaaaaaa')).toBeInTheDocument();
		await expect.element(page.getByText('bbbbbbb')).toBeInTheDocument();
		await expect.element(page.getByText('your next commit')).toBeInTheDocument();
		await expect.element(page.getByText('main', { exact: true })).toBeInTheDocument();
		const stations = page.getByTestId('commit-station');
		await expect.poll(() => stations.elements().length).toBe(3);
	});
});
