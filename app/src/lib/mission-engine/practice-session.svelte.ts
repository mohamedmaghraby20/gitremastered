/**
 * practice-session.svelte.ts
 * The practice side of one open lesson: builds its practice folder, rebuilds it on reset,
 * and remembers the caption for the last command typed in the terminal.
 * Its fields are Svelte state ($state), so screens that read them update by themselves.
 */

import { isTauri } from '@tauri-apps/api/core';
import { openPracticeRepo, resetPracticeRepo } from '$lib/tauri/commands';
import { explainCommand, type CommandCaption } from '$lib/visualizer/explain-command';

/** The two core commands the session uses; tests pass fakes. */
export type PracticeCommands = {
	openPracticeRepo: (missionId: string, setupSteps: string[]) => Promise<string>;
	resetPracticeRepo: (missionId: string) => Promise<string>;
	isDesktopApp: () => boolean;
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

	private readonly missionId: string;
	private readonly setupSteps: string[];
	private readonly commands: PracticeCommands;

	/**
	 * @param missionId - names the practice folder (the lesson ID)
	 * @param setupSteps - the mission's setup commands
	 * @param commands - the core commands (real ones by default)
	 */
	constructor(missionId: string, setupSteps: string[], commands: PracticeCommands = realCommands) {
		this.missionId = missionId;
		this.setupSteps = setupSteps;
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
		await this.buildFolder('Opening your practice folder…', () =>
			this.commands.openPracticeRepo(this.missionId, this.setupSteps)
		);
	}

	/** Deletes the practice folder and builds it again from the setup steps. */
	async reset(): Promise<void> {
		if (!this.commands.isDesktopApp()) {
			return;
		}
		this.lastCaption = null;
		await this.buildFolder('Resetting the practice folder…', () =>
			this.commands.resetPracticeRepo(this.missionId)
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
	 * @param buildStep - creates or resets the folder and returns its path
	 */
	private async buildFolder(
		waitingMessage: string,
		buildStep: () => Promise<string>
	): Promise<void> {
		this.practiceFolderPath = null;
		this.statusMessage = waitingMessage;
		try {
			this.practiceFolderPath = await buildStep();
		} catch (error) {
			this.statusMessage = `The practice folder could not be built: ${String(error)}`;
		}
	}
}
