/**
 * practice-session.test.ts
 * Tests for one lesson's practice session, with fake core commands.
 */

import { describe, expect, it, vi } from 'vitest';
import { PracticeSession, type PracticeCommands } from './practice-session.svelte';

/**
 * Builds fake core commands.
 * @param isDesktopApp - whether the app runs in the desktop window
 * @returns the fake commands
 */
function fakeCommands(isDesktopApp = true) {
	return {
		openPracticeRepo: vi.fn<PracticeCommands['openPracticeRepo']>(() =>
			Promise.resolve('/practice/three-areas')
		),
		resetPracticeRepo: vi.fn<PracticeCommands['resetPracticeRepo']>(() =>
			Promise.resolve('/practice/three-areas')
		),
		isDesktopApp: () => isDesktopApp
	};
}

describe('PracticeSession', () => {
	it('builds the practice folder from the setup steps', async () => {
		const commands = fakeCommands();
		const session = new PracticeSession('three-areas', ['git init'], commands);

		await session.start();

		expect(commands.openPracticeRepo).toHaveBeenCalledWith('three-areas', ['git init']);
		expect(session.practiceFolderPath).toBe('/practice/three-areas');
	});

	it('explains that the terminal needs the desktop app in a plain browser', async () => {
		const commands = fakeCommands(false);
		const session = new PracticeSession('three-areas', [], commands);

		await session.start();

		expect(commands.openPracticeRepo).not.toHaveBeenCalled();
		expect(session.statusMessage).toMatch(/desktop app/);
	});

	it('shows a readable message when setup fails', async () => {
		const commands = fakeCommands();
		commands.openPracticeRepo.mockRejectedValue('Git is not installed');
		const session = new PracticeSession('three-areas', [], commands);

		await session.start();

		expect(session.practiceFolderPath).toBeNull();
		expect(session.statusMessage).toMatch(/Git is not installed/);
	});

	it('keeps the caption of the last Git command only', () => {
		const session = new PracticeSession('three-areas', [], fakeCommands());

		session.recordCommandLine('git add notes.txt');
		session.recordCommandLine('ls');

		expect(session.lastCaption?.commandLine).toBe('git add notes.txt');
	});

	it('resets the folder and clears the caption', async () => {
		const commands = fakeCommands();
		const session = new PracticeSession('three-areas', [], commands);
		await session.start();
		session.recordCommandLine('git status');

		await session.reset();

		expect(commands.resetPracticeRepo).toHaveBeenCalledWith('three-areas');
		expect(session.lastCaption).toBeNull();
		expect(session.practiceFolderPath).toBe('/practice/three-areas');
	});
});
