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

	it('fades a commit no branch reaches and marks it "no branch"', async () => {
		document.body.style.height = '400px';
		const lostCommit = {
			id: 'c'.repeat(40),
			message: 'Add ntoes',
			parentIds: [firstId],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:03:00+00:00',
			isReachable: false
		};
		const amended = { ...twoCommitSnapshot, commits: [lostCommit, ...twoCommitSnapshot.commits] };
		await render(HistoryMap, { snapshot: amended });

		const lostStation = page.getByTestId('commit-station').filter({ hasText: 'ccccccc' });
		await expect.element(lostStation).toHaveAttribute('data-unreachable', 'true');
		await expect.poll(() => lostStation.element().textContent).toContain('no branch');
	});

	it('labels a remote-tracking branch, a tag and a detached HEAD', async () => {
		document.body.style.height = '400px';
		const snapshot = {
			...twoCommitSnapshot,
			branches: [
				...twoCommitSnapshot.branches,
				{
					name: 'origin/main',
					commitId: firstId,
					isRemote: true,
					upstream: null,
					ahead: 0,
					behind: 0
				}
			],
			tags: [{ name: 'v1.0', commitId: firstId, isAnnotated: false }],
			head: { kind: 'detached' as const, commitId: firstId }
		};
		await render(HistoryMap, { snapshot });

		await expect.element(page.getByText('origin/main')).toBeInTheDocument();
		await expect.element(page.getByText('v1.0')).toBeInTheDocument();
		await expect.element(page.getByText('HEAD · detached')).toBeInTheDocument();
	});
});
