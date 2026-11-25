/**
 * progress.test.ts
 * Tests for saving and loading progress, with a fake storage standing in for the Tauri store.
 */

import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import {
	createMemoryStorage,
	loadProgress,
	markMissionFinished,
	progress,
	resetProgress,
	saveQuizResult,
	saveTerminalFontSize,
	saveThemeChoice
} from './progress';

describe('progress', () => {
	it('starts empty with the system theme when nothing was saved', async () => {
		const loaded = await loadProgress(createMemoryStorage());
		expect(loaded).toEqual({
			finishedMissions: [],
			quizResults: {},
			theme: 'system',
			terminalFontSize: null
		});
	});

	it('saves finished missions, quiz results and the theme and text size, and loads them again', async () => {
		const storage = createMemoryStorage();
		await loadProgress(storage);

		await markMissionFinished('three-areas');
		await markMissionFinished('three-areas');
		await saveQuizResult('three-areas', { correctCount: 2, questionCount: 3 });
		await saveThemeChoice('dark');
		await saveTerminalFontSize(16);

		// A new session: load from the same storage.
		const reloaded = await loadProgress(storage);
		expect(reloaded).toEqual({
			finishedMissions: ['three-areas'],
			quizResults: { 'three-areas': { correctCount: 2, questionCount: 3 } },
			theme: 'dark',
			terminalFontSize: 16
		});
	});

	it('writes to disk (save) after every change', async () => {
		const storage = createMemoryStorage();
		const saveSpy = vi.spyOn(storage, 'save');
		await loadProgress(storage);

		await markMissionFinished('three-areas');

		expect(saveSpy).toHaveBeenCalledOnce();
	});

	it('resets missions and quizzes but keeps the theme and text size', async () => {
		await loadProgress(createMemoryStorage());
		await saveThemeChoice('dark');
		await saveTerminalFontSize(16);
		await markMissionFinished('three-areas');

		await resetProgress();

		expect(get(progress)).toEqual({
			finishedMissions: [],
			quizResults: {},
			theme: 'dark',
			terminalFontSize: 16
		});
	});
});
