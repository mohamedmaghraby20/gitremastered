/**
 * github-watch.svelte.ts
 * Keeps a GitHub challenge's view of its practice repository fresh, without asking GitHub
 * on every snapshot (assumption A6). It reads the repository:
 * - once when the challenge starts,
 * - after a local change (a push, say), at most once every 10 seconds,
 * - every 20 seconds while a GitHub goal is still open,
 * - whenever the student presses "Check GitHub now".
 * Its fields are Svelte state, so the mission panel updates by itself.
 */

import type { GitHubContext, GitHubState } from '$lib/types/github';

/** The shortest wait between two reads caused by local changes. */
export const smallestReadGap = 10_000;

/** How often to read while a GitHub goal is still open. */
export const openGoalReadInterval = 20_000;

/** Reads a repository's state; the app passes the Tauri command, tests a fake. */
export type ReadGitHubState = (repoName: string) => Promise<GitHubState>;

/** One challenge's GitHub view. */
export class GitHubWatch {
	/** The latest state and the challenge's start, or null before the first read. */
	context: GitHubContext | null = $state(null);
	/** The last read's problem, in words, or null when it worked. */
	problem: string | null = $state(null);
	/** True while a read is running. */
	isReading = $state(false);

	private readonly repoName: string;
	private readonly startedAt: string;
	private readonly readState: ReadGitHubState;
	private readonly now: () => number;
	private lastReadAt = 0;
	private waitingRead: ReturnType<typeof setTimeout> | null = null;
	private repeatingRead: ReturnType<typeof setInterval> | null = null;

	/**
	 * @param repoName - the practice repository, like "gitremastered-practice-flow"
	 * @param startedAt - when the challenge was built (ISO 8601)
	 * @param readState - reads the repository's state
	 * @param now - the clock, in milliseconds (tests pass a fake)
	 */
	constructor(repoName: string, startedAt: string, readState: ReadGitHubState, now = Date.now) {
		this.repoName = repoName;
		this.startedAt = startedAt;
		this.readState = readState;
		this.now = now;
	}

	/** Reads GitHub right away (the first read, and the "Check GitHub now" button). */
	async readNow(): Promise<void> {
		this.cancelWaitingRead();
		this.lastReadAt = this.now();
		this.isReading = true;
		try {
			const state = await this.readState(this.repoName);
			this.context = { state, startedAt: this.startedAt };
			this.problem = null;
		} catch (error) {
			this.problem = String(error);
		} finally {
			this.isReading = false;
		}
	}

	/**
	 * Reacts to a local change: reads soon, but never twice within 10 seconds.
	 * Inputs: none. Output: none.
	 */
	noticeLocalChange(): void {
		if (this.waitingRead !== null) {
			return;
		}
		const sinceLastRead = this.now() - this.lastReadAt;
		const wait = Math.max(0, smallestReadGap - sinceLastRead);
		this.waitingRead = setTimeout(() => {
			this.waitingRead = null;
			void this.readNow();
		}, wait);
	}

	/**
	 * Reads every 20 seconds while a GitHub goal is open, and stops once none is.
	 * @param hasOpenGoal - true while at least one GitHub goal is not met
	 */
	keepReadingWhile(hasOpenGoal: boolean): void {
		if (hasOpenGoal && this.repeatingRead === null) {
			this.repeatingRead = setInterval(() => void this.readNow(), openGoalReadInterval);
		}
		if (!hasOpenGoal && this.repeatingRead !== null) {
			clearInterval(this.repeatingRead);
			this.repeatingRead = null;
		}
	}

	/** Stops every timer (when the lesson closes or another challenge starts). */
	stop(): void {
		this.cancelWaitingRead();
		this.keepReadingWhile(false);
	}

	/** Cancels a read that was waiting for the 10-second gap. */
	private cancelWaitingRead(): void {
		if (this.waitingRead !== null) {
			clearTimeout(this.waitingRead);
			this.waitingRead = null;
		}
	}
}
