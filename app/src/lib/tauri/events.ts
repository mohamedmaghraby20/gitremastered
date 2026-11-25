/**
 * events.ts
 * Typed listeners for every event the Rust core announces (SPEC.md section 3.3).
 * Each function starts listening and returns a function that stops listening.
 */

import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/** Output from a shell session. */
export type TerminalOutput = { sessionId: string; text: string };

/** A shell session ended. */
export type TerminalExited = { sessionId: string; exitCode: number };

/**
 * Listens for shell output.
 * @param handleOutput - called with each piece of output, in order
 * @returns a function that stops listening
 */
export function onTerminalOutput(
	handleOutput: (output: TerminalOutput) => void
): Promise<UnlistenFn> {
	return listen<TerminalOutput>('terminal_output', (event) => handleOutput(event.payload));
}

/**
 * Listens for shell sessions ending.
 * @param handleExit - called with the session ID and its exit code
 * @returns a function that stops listening
 */
export function onTerminalExited(
	handleExit: (exited: TerminalExited) => void
): Promise<UnlistenFn> {
	return listen<TerminalExited>('terminal_exited', (event) => handleExit(event.payload));
}

/**
 * Listens for changes in the practice repository.
 * @param handleSnapshot - called with the new repository snapshot
 * @returns a function that stops listening
 */
export function onRepoChanged(
	handleSnapshot: (snapshot: RepoSnapshot) => void
): Promise<UnlistenFn> {
	return listen<RepoSnapshot>('repo_changed', (event) => handleSnapshot(event.payload));
}
