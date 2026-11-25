/**
 * repo-snapshot.test.ts
 * Tests for the snapshot store: it holds the latest snapshot from "repo_changed" events.
 */

import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { onRepoChanged } from '$lib/tauri/events';
import { clearRepoSnapshot, currentRepoSnapshot, startRepoSnapshotUpdates } from './repo-snapshot';

// Replace the real event listener so tests can fire "repo_changed" themselves.
vi.mock('$lib/tauri/events', () => ({ onRepoChanged: vi.fn() }));

/**
 * Builds a snapshot with a given number of untracked files, to tell snapshots apart.
 * @param untrackedCount - how many untracked files
 * @returns the snapshot
 */
function snapshotWithUntracked(untrackedCount: number): RepoSnapshot {
	return {
		commits: [],
		branches: [],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: null },
		stagedFiles: [],
		modifiedFiles: [],
		untrackedFiles: Array.from({ length: untrackedCount }, (_, index) => `file-${index}.txt`)
	};
}

describe('currentRepoSnapshot', () => {
	let fireRepoChanged: (snapshot: RepoSnapshot) => void = () => {};
	const stopListening = vi.fn();

	beforeEach(() => {
		clearRepoSnapshot();
		vi.mocked(onRepoChanged).mockImplementation((handler) => {
			fireRepoChanged = handler;
			return Promise.resolve(stopListening);
		});
	});

	it('starts empty', () => {
		expect(get(currentRepoSnapshot)).toBeNull();
	});

	it('holds the latest snapshot from repo_changed events', async () => {
		await startRepoSnapshotUpdates();

		fireRepoChanged(snapshotWithUntracked(1));
		fireRepoChanged(snapshotWithUntracked(2));

		expect(get(currentRepoSnapshot)?.untrackedFiles).toHaveLength(2);
	});

	it('returns a function that stops listening', async () => {
		const stop = await startRepoSnapshotUpdates();
		stop();
		expect(stopListening).toHaveBeenCalledOnce();
	});
});
