/**
 * practice-session.svelte.ts
 * The practice side of one open lesson: builds its practice folder for the active challenge,
 * rebuilds it on reset or when another challenge starts, and remembers the caption for the last
 * command typed in the terminal. A GitHub challenge is only built after the student agreed in
 * the app's consent dialog (Rust keeps that answer; this session only asks whether it exists).
 * Its fields are Svelte state ($state), so screens that read them update by themselves.
 */

import { isTauri } from '@tauri-apps/api/core';
import { getGitHubConsent, openPracticeRepo, resetPracticeRepo } from '$lib/tauri/commands';
import type { GitHubChallenge } from '$lib/types/github';
import { explainCommand, type CommandCaption } from '$lib/visualizer/explain-command';

/** The core commands the session uses; tests pass fakes. */
export type PracticeCommands = {
	openPracticeRepo: (
		missionId: string,
		setupSteps: string[],
		github: GitHubChallenge | null
	) => Promise<string>;
	resetPracticeRepo: (missionId: string, github: GitHubChallenge | null) => Promise<string>;
	hasGitHubConsent: () => Promise<boolean>;
	isDesktopApp: () => boolean;
};

const realCommands: PracticeCommands = {
	openPracticeRepo,
	resetPracticeRepo,
	hasGitHubConsent: getGitHubConsent,
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
	/** True while a build runs; screens disable Start and Reset meanwhile. */
	isBuilding = $state(false);

	private readonly missionId: string;
	private setupSteps: string[];
	private github: GitHubChallenge | null;
	private readonly commands: PracticeCommands;
	/** Counts builds, so the answer of a build that a newer one replaced is ignored. */
	private latestBuildNumber = 0;

	/**
	 * @param missionId - names the practice folder (the lesson ID)
	 * @param setupSteps - the active challenge's setup commands
	 * @param github - the active challenge's GitHub field, or null for a local challenge
	 * @param commands - the core commands (real ones by default)
	 */
	constructor(
		missionId: string,
		setupSteps: string[],
		github: GitHubChallenge | null = null,
		commands: PracticeCommands = realCommands
	) {
		this.missionId = missionId;
		this.setupSteps = setupSteps;
		this.github = github;
		this.commands = commands;
	}

	/**
	 * Tells whether the app runs in the desktop window (where Rust and the terminal exist).
	 * @returns true in the desktop app, false in a plain browser
	 */
	isDesktopApp(): boolean {
		return this.commands.isDesktopApp();
	}

	/** Opens the lesson's practice folder as the student left it, or builds it. */
	async start(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			this.statusMessage = 'The terminal runs in the desktop app (pnpm tauri dev).';
			return;
		}
		await this.buildFolder('Opening your practice folder…', () =>
			this.commands.openPracticeRepo(this.missionId, this.setupSteps, this.github)
		);
	}

	/** Deletes the practice folder and builds it again from the setup steps. */
	async reset(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			return;
		}
		this.lastCaption = null;
		await this.buildFolder('Resetting the practice folder…', () =>
			this.commands.resetPracticeRepo(this.missionId, this.github)
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
		await this.buildFolder('Setting up the challenge…', () =>
			this.commands.openPracticeRepo(this.missionId, this.setupSteps, this.github)
		);
	}

	/**
	 * Builds the active GitHub challenge right after the student agreed in the consent dialog.
	 * Inputs: none. Output: none.
	 */
	async buildAfterConsent(): Promise<void> {
		await this.start();
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
	 * A GitHub challenge without consent is not built: the consent card shows instead. When a
	 * newer build starts before this one ends, this one's answer is ignored (code review
	 * finding 1); Rust also runs only one build at a time.
	 * @param waitingMessage - shown while building
	 * @param buildStep - creates or resets the folder and returns its path
	 */
	private async buildFolder(
		waitingMessage: string,
		buildStep: () => Promise<string>
	): Promise<void> {
		this.latestBuildNumber += 1;
		const buildNumber = this.latestBuildNumber;
		this.practiceFolderPath = null;
		const isGitHubChallenge = this.github !== null;
		const hasConsent = isGitHubChallenge ? await this.commands.hasGitHubConsent() : true;
		if (buildNumber !== this.latestBuildNumber) {
			return;
		}
		this.needsGitHubConsent = !hasConsent;
		if (!hasConsent) {
			this.statusMessage = 'This challenge runs on GitHub. Read and accept the consent first.';
			return;
		}
		this.statusMessage = isGitHubChallenge
			? 'Preparing your practice repository on GitHub…'
			: waitingMessage;
		this.isBuilding = true;
		try {
			const folderPath = await buildStep();
			if (buildNumber === this.latestBuildNumber) {
				this.practiceFolderPath = folderPath;
			}
		} catch (error) {
			if (buildNumber === this.latestBuildNumber) {
				this.statusMessage = `The practice folder could not be built: ${String(error)}`;
			}
		} finally {
			if (buildNumber === this.latestBuildNumber) {
				this.isBuilding = false;
			}
		}
	}
}
