/**
 * repo-snapshot.ts
 * The shared store with the latest snapshot of the open lesson's practice repo.
 * The Rust core sends a "repo_changed" event after every change; the visualizer and the
 * challenge read this store instead of listening themselves.
 */

import { writable, type Readable } from 'svelte/store';
import { onRepoChanged } from '$lib/tauri/events';
import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';

const snapshotStore = writable<RepoSnapshot | null>(null);

/** The latest snapshot, or null before the first one arrives. Read-only for screens. */
export const currentRepoSnapshot: Readable<RepoSnapshot | null> = snapshotStore;

/**
 * Starts copying every "repo_changed" snapshot into the store.
 * @returns a function that stops listening
 */
export async function startRepoSnapshotUpdates(): Promise<() => void> {
	return onRepoChanged((snapshot) => snapshotStore.set(snapshot));
}

/** Empties the store, for example when a lesson closes or its practice folder is rebuilt. */
export function clearRepoSnapshot(): void {
	snapshotStore.set(null);
}
