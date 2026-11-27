/**
 * practice-session.test.ts
 * Tests for one lesson's practice session, with fake core commands.
 */

import { describe, expect, it, vi } from 'vitest';
import { PracticeSession, type PracticeCommands } from './practice-session.svelte';

/**
 * Builds fake core commands.
 * @param isDesktopApp - whether the app runs in the desktop window
 * @param hasConsent - whether the student agreed to practise on GitHub
 * @returns the fake commands
 */
function fakeCommands(isDesktopApp = true, hasConsent = false) {
	return {
		openPracticeRepo: vi.fn<PracticeCommands['openPracticeRepo']>(() =>
			Promise.resolve('/practice/three-areas')
		),
		resetPracticeRepo: vi.fn<PracticeCommands['resetPracticeRepo']>(() =>
			Promise.resolve('/practice/three-areas')
		),
		hasGitHubConsent: vi.fn(() => Promise.resolve(hasConsent)),
		isDesktopApp: () => isDesktopApp
	};
}

describe('PracticeSession', () => {
	it('builds the practice folder from the setup steps', async () => {
		const commands = fakeCommands();
		const session = new PracticeSession('three-areas', ['git init'], null, commands);

		await session.start();

		expect(commands.openPracticeRepo).toHaveBeenCalledWith('three-areas', ['git init'], null);
		expect(session.practiceFolderPath).toBe('/practice/three-areas');
	});

	it('builds another challenge from its own setup, and starts the same one over', async () => {
		const commands = fakeCommands();
		const session = new PracticeSession('three-areas', ['git init'], null, commands);
		await session.start();

		await session.startChallenge(['git init', 'echo two > two.txt']);
		expect(commands.openPracticeRepo).toHaveBeenLastCalledWith(
			'three-areas',
			['git init', 'echo two > two.txt'],
			null
		);

		await session.startChallenge(['git init', 'echo two > two.txt']);
		expect(commands.resetPracticeRepo).toHaveBeenCalledWith('three-areas', null);
	});

	it('explains that the terminal needs the desktop app in a plain browser', async () => {
		const commands = fakeCommands(false);
		const session = new PracticeSession('three-areas', [], null, commands);

		await session.start();

		expect(commands.openPracticeRepo).not.toHaveBeenCalled();
		expect(session.statusMessage).toMatch(/desktop app/);
	});

	it('shows a readable message when setup fails', async () => {
		const commands = fakeCommands();
		commands.openPracticeRepo.mockRejectedValue('Git is not installed');
		const session = new PracticeSession('three-areas', [], null, commands);

		await session.start();

		expect(session.practiceFolderPath).toBeNull();
		expect(session.statusMessage).toMatch(/Git is not installed/);
	});

	it('keeps the caption of the last Git command only', () => {
		const session = new PracticeSession('three-areas', [], null, fakeCommands());

		session.recordCommandLine('git add notes.txt');
		session.recordCommandLine('ls');

		expect(session.lastCaption?.commandLine).toBe('git add notes.txt');
	});

	it('resets the folder and clears the caption', async () => {
		const commands = fakeCommands();
		const session = new PracticeSession('three-areas', [], null, commands);
		await session.start();
		session.recordCommandLine('git status');

		await session.reset();

		expect(commands.resetPracticeRepo).toHaveBeenCalledWith('three-areas', null);
		expect(session.lastCaption).toBeNull();
		expect(session.practiceFolderPath).toBe('/practice/three-areas');
	});

	const github = { repo: 'gitremastered-practice-flow', upstream: null, teammate: [] };

	it('does not build a GitHub challenge without consent: the consent card shows', async () => {
		const commands = fakeCommands(true, false);
		const session = new PracticeSession('github-flow-prs', ['git init'], github, commands);

		await session.start();

		expect(commands.openPracticeRepo).not.toHaveBeenCalled();
		expect(session.needsGitHubConsent).toBe(true);
	});

	it('builds a GitHub challenge once consent is given', async () => {
		const commands = fakeCommands(true, true);
		const session = new PracticeSession('github-flow-prs', ['git init'], github, commands);

		await session.start();

		expect(commands.openPracticeRepo).toHaveBeenCalledWith('github-flow-prs', ['git init'], github);
		expect(session.needsGitHubConsent).toBe(false);
	});

	it('ignores the answer of a build that a newer build replaced', async () => {
		const commands = fakeCommands();
		let finishFirstBuild: (path: string) => void = () => {};
		commands.openPracticeRepo.mockImplementationOnce(
			() => new Promise((resolve) => (finishFirstBuild = resolve))
		);
		const session = new PracticeSession('three-areas', ['git init'], null, commands);

		const firstBuild = session.start();
		await Promise.resolve();
		await session.startChallenge(['git init', 'echo two > two.txt']);
		finishFirstBuild('/practice/old-build');
		await firstBuild;

		expect(session.practiceFolderPath).toBe('/practice/three-areas');
	});
});
