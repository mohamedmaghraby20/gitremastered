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
			authoredAt: '2026-11-25T10:05:00+00:00',
			isReachable: true
		},
		{
			id: firstId,
			message: 'Add README',
			parentIds: [],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:00:00+00:00',
			isReachable: true
		}
	],
	branches: [
		{ name: 'main', commitId: secondId, isRemote: false, upstream: null, ahead: 0, behind: 0 }
	],
	tags: [],
	head: { kind: 'branch', branchName: 'main', commitId: secondId },
	stagedFiles: [],
	modifiedFiles: [],
	untrackedFiles: [],
	committedFiles: [],
	conflictedFiles: [],
	operation: null,
	stashes: [],
	remotes: [],
	localConfig: [],
	answer: null
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

	it('puts HEAD and the branch label above the commit ring', async () => {
		document.body.style.height = '400px';
		await render(HistoryMap, { snapshot: twoCommitSnapshot });

		const branchLabel = page.getByText('main', { exact: true });
		await expect.element(branchLabel).toBeInTheDocument();
		const headStation = page.getByTestId('commit-station').filter({ hasText: 'HEAD · you' });
		const ring = headStation.getByTestId('station-ring').element();
		const labelBottom = branchLabel.element().getBoundingClientRect().bottom;
		expect(labelBottom).toBeLessThanOrEqual(ring.getBoundingClientRect().top);
	});

	it('offers zoom in, zoom out and fit buttons', async () => {
		document.body.style.height = '400px';
		await render(HistoryMap, { snapshot: twoCommitSnapshot });

		await expect.element(page.getByRole('button', { name: /zoom in/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /zoom out/i })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: /fit view/i })).toBeInTheDocument();
	});
});
