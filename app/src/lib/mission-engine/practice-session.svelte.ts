/**
 * practice-session.svelte.ts
 * The practice side of one open lesson: builds its practice folder for the active challenge,
 * rebuilds it on reset or when another challenge starts, and remembers the caption for the last
 * command typed in the terminal. A GitHub challenge is only built after the student agreed to
 * the GitHub consent screen; its start time is reported, so GitHub goals count only new work.
 * Its fields are Svelte state ($state), so screens that read them update by themselves.
 */

import { isTauri } from '@tauri-apps/api/core';
import { openPracticeRepo, resetPracticeRepo } from '$lib/tauri/commands';
import type { GitHubChallenge } from '$lib/types/github';
import { explainCommand, type CommandCaption } from '$lib/visualizer/explain-command';

/** The two core commands the session uses; tests pass fakes. */
export type PracticeCommands = {
	openPracticeRepo: (
		missionId: string,
		setupSteps: string[],
		github: GitHubChallenge | null,
		githubConsent: boolean
	) => Promise<string>;
	resetPracticeRepo: (
		missionId: string,
		github: GitHubChallenge | null,
		githubConsent: boolean
	) => Promise<string>;
	isDesktopApp: () => boolean;
};

/** How the session learns about GitHub consent and reports a GitHub challenge's start. */
export type GitHubHooks = {
	hasConsent: () => boolean;
	onChallengeStarted: (startedAt: string) => void;
};

/** GitHub's clock and ours may differ a little; a start this much earlier still counts. */
const clockMargin = 60_000;

const noGitHubHooks: GitHubHooks = {
	hasConsent: () => false,
	onChallengeStarted: () => {}
};

const realCommands: PracticeCommands = {
	openPracticeRepo,
	resetPracticeRepo,
	isDesktopApp: isTauri
};

/** One lesson's practice folder and terminal caption. */
export class PracticeSession {
	/** The practice folder's path, or null while it is being built (or outside the app). */
	practiceFolderPath: string | null = $state(null);
	/** A short status line shown while there is no folder. */
	statusMessage = $state('Opening your practice folder…');
	/** The caption for the last Git command typed, or null before the first one. */
	lastCaption: CommandCaption | null = $state(null);
	/** True when the active challenge is a GitHub challenge waiting for the student's consent. */
	needsGitHubConsent = $state(false);

	private readonly missionId: string;
	private setupSteps: string[];
	private github: GitHubChallenge | null;
	private readonly commands: PracticeCommands;
	private readonly githubHooks: GitHubHooks;

	/**
	 * @param missionId - names the practice folder (the lesson ID)
	 * @param setupSteps - the active challenge's setup commands
	 * @param github - the active challenge's GitHub field, or null for a local challenge
	 * @param githubHooks - consent and start-time reporting (none by default)
	 * @param commands - the core commands (real ones by default)
	 */
	constructor(
		missionId: string,
		setupSteps: string[],
		github: GitHubChallenge | null = null,
		githubHooks: GitHubHooks = noGitHubHooks,
		commands: PracticeCommands = realCommands
	) {
		this.missionId = missionId;
		this.setupSteps = setupSteps;
		this.github = github;
		this.githubHooks = githubHooks;
		this.commands = commands;
	}

	/**
	 * Tells whether the app runs in the desktop window (where Rust and the terminal exist).
	 * @returns true in the desktop app, false in a plain browser
	 */
	isDesktopApp(): boolean {
		return this.commands.isDesktopApp();
	}

	/** Builds a fresh practice folder for the lesson. */
	async start(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			this.statusMessage = 'The terminal runs in the desktop app (pnpm tauri dev).';
			return;
		}
		// The folder may be kept as the student left it, so this is not a fresh start.
		await this.buildFolder('Opening your practice folder…', false, () =>
			this.commands.openPracticeRepo(
				this.missionId,
				this.setupSteps,
				this.github,
				this.githubHooks.hasConsent()
			)
		);
	}

	/** Deletes the practice folder and builds it again from the setup steps. */
	async reset(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			return;
		}
		this.lastCaption = null;
		await this.buildFolder('Resetting the practice folder…', true, () =>
			this.commands.resetPracticeRepo(this.missionId, this.github, this.githubHooks.hasConsent())
		);
	}

	/**
	 * Starts a challenge: builds the practice folder in that challenge's starting state.
	 * Starting the same challenge again starts it over from a fresh folder.
	 * @param setupSteps - the challenge's setup commands
	 * @param github - the challenge's GitHub field, or null for a local challenge
	 */
	async startChallenge(setupSteps: string[], github: GitHubChallenge | null = null): Promise<void> {
		const isSameChallenge = JSON.stringify(setupSteps) === JSON.stringify(this.setupSteps);
		this.setupSteps = setupSteps;
		this.github = github;
		if (isSameChallenge) {
			await this.reset();
			return;
		}
		if (!this.commands.isDesktopApp()) {
			return;
		}
		this.lastCaption = null;
		await this.buildFolder('Setting up the challenge…', true, () =>
			this.commands.openPracticeRepo(
				this.missionId,
				this.setupSteps,
				this.github,
				this.githubHooks.hasConsent()
			)
		);
	}

	/**
	 * Builds the active GitHub challenge right after the student accepted the consent screen.
	 * Inputs: none. Output: none.
	 */
	async buildAfterConsent(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			return;
		}
		await this.buildFolder('Setting up the challenge…', true, () =>
			this.commands.openPracticeRepo(
				this.missionId,
				this.setupSteps,
				this.github,
				this.githubHooks.hasConsent()
			)
		);
	}

	/**
	 * Remembers a command line typed in the terminal, if it is a Git command we can explain.
	 * @param commandLine - the line, e.g. "git add notes.txt"
	 */
	recordCommandLine(commandLine: string): void {
		const caption = explainCommand(commandLine);
		if (caption !== null) {
			this.lastCaption = caption;
		}
	}

	/**
	 * Clears the folder (which stops the terminal), runs a build step, and shows the result.
	 * @param waitingMessage - shown while building
	 * @param isFreshStart - true when the folder is surely rebuilt (reset, a new challenge)
	 * @param buildStep - creates or resets the folder and returns its path
	 */
	private async buildFolder(
		waitingMessage: string,
		isFreshStart: boolean,
		buildStep: () => Promise<string>
	): Promise<void> {
		this.practiceFolderPath = null;
		this.needsGitHubConsent = this.github !== null && !this.githubHooks.hasConsent();
		if (this.needsGitHubConsent) {
			this.statusMessage = 'This challenge runs on GitHub. Read and accept the consent first.';
			return;
		}
		this.statusMessage =
			this.github === null ? waitingMessage : 'Preparing your practice repository on GitHub…';
		const startedAt = timeAsText(Date.now() - clockMargin);
		try {
			this.practiceFolderPath = await buildStep();
			if (this.github !== null && isFreshStart) {
				this.githubHooks.onChallengeStarted(startedAt);
			}
		} catch (error) {
			this.statusMessage = `The practice folder could not be built: ${String(error)}`;
		}
	}
}

/**
 * Writes a moment as ISO 8601 text, like "2026-11-27T10:00:00.000Z".
 * @param milliseconds - the moment, in milliseconds since 1970
 * @returns the text
 */
function timeAsText(milliseconds: number): string {
	return new Date(milliseconds).toISOString();
}
