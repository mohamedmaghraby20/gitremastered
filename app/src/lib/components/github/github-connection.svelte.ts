/**
 * github-connection.svelte.ts
 * Reads whether the student's GitHub CLI (`gh`) is installed and signed in, and keeps the
 * answer as Svelte state, so the consent card and the Settings section share one way to ask.
 * In a plain browser (no desktop app) there is nothing to ask, so it says so instead.
 */

import { isTauri } from '@tauri-apps/api/core';
import { getGitHubConnection } from '$lib/tauri/commands';
import type { GitHubConnection } from '$lib/types/github';

/** The student's GitHub connection, read on request. */
export class GitHubConnectionReader {
	/** The latest answer, or null before the first read or after a failed one. */
	connection: GitHubConnection | null = $state(null);
	/** True while a read is running. */
	isChecking = $state(false);
	/** What went wrong in the last read, in words, or null. */
	problem: string | null = $state(null);
	/** False in a plain browser, where the Tauri commands do not exist. */
	readonly isDesktopApp: boolean = isTauri();

	/** Asks the Rust core about the GitHub CLI. Inputs: none. Output: none (fills the fields). */
	async check(): Promise<void> {
		if (!this.isDesktopApp) {
			return;
		}
		this.isChecking = true;
		try {
			this.connection = await getGitHubConnection();
			this.problem = null;
		} catch (error) {
			this.problem = String(error);
		} finally {
			this.isChecking = false;
		}
	}

	/** True once `gh` is installed and signed in. */
	get isConnected(): boolean {
		return this.connection !== null && this.connection.isGhInstalled && this.connection.isSignedIn;
	}
}
