/**
 * progress.test.ts
 * Tests for saving and loading progress, with a fake storage standing in for the Tauri store.
 */

import { get } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';
import {
	createMemoryStorage,
	loadProgress,
	markChallengeFinished,
	markMissionFinished,
	saveActiveChallenge,
	progress,
	resetProgress,
	saveChosenPath,
	saveLessonTextSize,
	saveMotionReduced,
	savePanelSizes,
	saveLayerRead,
	saveLessonOpened,
	saveQuizResult,
	saveTerminalFontSize,
	saveThemeChoice
} from './progress';

describe('progress', () => {
	it('starts empty with the system theme when nothing was saved', async () => {
		const loaded = await loadProgress(createMemoryStorage());
		expect(loaded).toEqual({
			finishedMissions: [],
			finishedChallenges: {},
			activeChallengeIds: {},
			quizResults: {},
			theme: 'system',
			terminalFontSize: null,
			isFilesDeskFolded: false,
			lastOpenedLessonId: null,
			furthestLayers: {},
			chosenPathId: 'pro-path',
			lessonTextSize: null,
			isMotionReduced: false,
			lessonColumnShare: null,
			terminalShare: null
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
			finishedChallenges: {},
			activeChallengeIds: {},
			quizResults: { 'three-areas': { correctCount: 2, questionCount: 3 } },
			theme: 'dark',
			terminalFontSize: 16,
			isFilesDeskFolded: false,
			lastOpenedLessonId: null,
			furthestLayers: {},
			chosenPathId: 'pro-path',
			lessonTextSize: null,
			isMotionReduced: false,
			lessonColumnShare: null,
			terminalShare: null
		});
	});

	it('remembers the last opened lesson and the furthest layer read, across sessions', async () => {
		const storage = createMemoryStorage();
		await loadProgress(storage);

		await saveLessonOpened('three-areas');
		await saveLayerRead('three-areas', 'underTheHood');
		await saveLayerRead('three-areas', 'mustKnow');
		await saveLessonOpened('ignoring-files');

		const reloaded = await loadProgress(storage);
		expect(reloaded.lastOpenedLessonId).toBe('ignoring-files');
		expect(reloaded.furthestLayers).toEqual({ 'three-areas': 'underTheHood' });
	});

	it('writes to disk (save) after every change', async () => {
		const storage = createMemoryStorage();
		const saveSpy = vi.spyOn(storage, 'save');
		await loadProgress(storage);

		await markMissionFinished('three-areas');

		expect(saveSpy).toHaveBeenCalledOnce();
	});

	it('resets missions, quizzes and reading places but keeps the theme and text size', async () => {
		await loadProgress(createMemoryStorage());
		await saveLessonOpened('three-areas');
		await saveLayerRead('three-areas', 'advanced');
		await saveThemeChoice('dark');
		await saveTerminalFontSize(16);
		await markMissionFinished('three-areas');

		await resetProgress();

		expect(get(progress)).toEqual({
			finishedMissions: [],
			finishedChallenges: {},
			activeChallengeIds: {},
			quizResults: {},
			theme: 'dark',
			terminalFontSize: 16,
			isFilesDeskFolded: false,
			lastOpenedLessonId: null,
			furthestLayers: {},
			chosenPathId: 'pro-path',
			lessonTextSize: null,
			isMotionReduced: false,
			lessonColumnShare: null,
			terminalShare: null
		});
	});

	it('remembers the chosen path, text size, reduce motion and panel sizes, and keeps them on reset', async () => {
		const storage = createMemoryStorage();
		await loadProgress(storage);

		await saveChosenPath('book-path');
		await saveLessonTextSize(20);
		await saveMotionReduced(true);
		await savePanelSizes({ lessonColumnShare: 40 });
		await savePanelSizes({ terminalShare: 60 });
		await resetProgress();

		const reloaded = await loadProgress(storage);
		expect(reloaded.chosenPathId).toBe('book-path');
		expect(reloaded.lessonTextSize).toBe(20);
		expect(reloaded.isMotionReduced).toBe(true);
		expect(reloaded.lessonColumnShare).toBe(40);
		expect(reloaded.terminalShare).toBe(60);
	});

	it('remembers finished challenges and the active one; a finished challenge marks the lesson done', async () => {
		const storage = createMemoryStorage();
		await loadProgress(storage);

		await saveActiveChallenge('three-areas', 'two-commits');
		await markChallengeFinished('three-areas', 'two-commits');
		await markChallengeFinished('three-areas', 'two-commits');

		const reloaded = await loadProgress(storage);
		expect(reloaded.finishedChallenges).toEqual({ 'three-areas': ['two-commits'] });
		expect(reloaded.activeChallengeIds).toEqual({ 'three-areas': 'two-commits' });
		expect(reloaded.finishedMissions).toEqual(['three-areas']);
	});
});
