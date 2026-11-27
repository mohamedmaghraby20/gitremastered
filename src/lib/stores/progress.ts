/**
 * progress.ts
 * The one module that saves and loads the student's progress: finished missions, quiz
 * results, the last opened lesson and the furthest layer read in each, plus screen choices
 * (theme, terminal and lesson text size, reduce motion, folded files desk, chosen path,
 * panel sizes). In the desktop app it uses the Tauri store
 * plugin (a small JSON file in the app's data folder); in a plain browser it keeps progress in
 * memory only.
 * Screens read the `progress` store and call the functions below; nothing else touches storage.
 */

import { writable, get, type Readable } from 'svelte/store';
import { isTauri } from '@tauri-apps/api/core';
import type { ThemeChoice } from '$lib/theme/theme';
import type { LessonLayerId } from '@gitremastered/course-engine/types/lesson';
import { isFurtherLayer } from '$lib/progress/learning-summary';

/** One saved quiz result. */
export type QuizResult = { correctCount: number; questionCount: number };

/** The two orders of the course: by what you need at work, or by Pro Git chapter. */
export type CoursePathId = 'pro-path' | 'book-path';

/** Everything the app remembers between sessions. */
export type ProgressData = {
	finishedMissions: string[]; // lesson IDs with at least one finished challenge ("lesson done")
	finishedChallenges: Record<string, string[]>; // by lesson ID, the challenge IDs finished
	activeChallengeIds: Record<string, string>; // by lesson ID, the challenge being worked on
	quizResults: Record<string, QuizResult>; // by lesson ID, the latest result
	theme: ThemeChoice;
	terminalFontSize: number | null; // pixels, chosen with Ctrl + / -; null = the design's size
	isFilesDeskFolded: boolean; // the student folded the visualizer's files desk away
	lastOpenedLessonId: string | null; // for "Pick up where you left off"; null before the first lesson
	furthestLayers: Record<string, LessonLayerId>; // by lesson ID, the deepest layer opened
	chosenPathId: CoursePathId; // the path picked on home and the course map
	lessonTextSize: number | null; // pixels, from Settings; null = the design's size
	isMotionReduced: boolean; // the app's own "Reduce motion" switch in Settings
	lessonColumnShare: number | null; // percent of the lesson screen's width; null = default
	terminalShare: number | null; // percent of the practice column's height; null = default
};

/** The few storage actions this module needs (the Tauri store has them; tests pass a fake). */
export type KeyValueStorage = {
	get: <Value>(key: string) => Promise<Value | undefined>;
	set: (key: string, value: unknown) => Promise<void>;
	save: () => Promise<void>;
};

/** The single key the progress is saved under. */
const progressKey = 'progress';

/** The file name of the store in the app's data folder. */
const storeFileName = 'progress.json';

/** Progress for a student who has not started yet. */
export const emptyProgress: ProgressData = {
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
};

const progressStore = writable<ProgressData>(emptyProgress);

/** The current progress, for screens to read (for example the sidebar's done marks). */
export const progress: Readable<ProgressData> = progressStore;

let storage: KeyValueStorage = createMemoryStorage();

/**
 * Chooses where progress is kept and loads what was saved.
 * @param chosenStorage - the storage to use; the Tauri store in the app by default
 * @returns the loaded progress
 */
export async function loadProgress(chosenStorage?: KeyValueStorage): Promise<ProgressData> {
	storage = chosenStorage ?? (await openDefaultStorage());
	const saved = await storage.get<Partial<ProgressData>>(progressKey);
	const loaded: ProgressData = { ...emptyProgress, ...saved };
	progressStore.set(loaded);
	return loaded;
}

/**
 * Remembers that a lesson's mission is done.
 * @param lessonId - the lesson
 */
export async function markMissionFinished(lessonId: string): Promise<void> {
	const current = get(progressStore);
	if (current.finishedMissions.includes(lessonId)) {
		return;
	}
	await saveProgress({ ...current, finishedMissions: [...current.finishedMissions, lessonId] });
}

/**
 * Remembers that a challenge is done; the lesson then counts as done too.
 * @param lessonId - the lesson
 * @param challengeId - the finished challenge
 */
export async function markChallengeFinished(lessonId: string, challengeId: string): Promise<void> {
	const current = get(progressStore);
	const finishedHere = current.finishedChallenges[lessonId] ?? [];
	if (finishedHere.includes(challengeId)) {
		return;
	}
	await saveProgress({
		...current,
		finishedChallenges: {
			...current.finishedChallenges,
			[lessonId]: [...finishedHere, challengeId]
		},
		finishedMissions: current.finishedMissions.includes(lessonId)
			? current.finishedMissions
			: [...current.finishedMissions, lessonId]
	});
}

/**
 * Remembers which challenge a lesson's practice project is set up for, so reopening the lesson
 * keeps the student's work in it.
 * @param lessonId - the lesson
 * @param challengeId - the challenge just started
 */
export async function saveActiveChallenge(lessonId: string, challengeId: string): Promise<void> {
	const current = get(progressStore);
	await saveProgress({
		...current,
		activeChallengeIds: { ...current.activeChallengeIds, [lessonId]: challengeId }
	});
}

/**
 * Remembers a lesson's latest quiz result.
 * @param lessonId - the lesson
 * @param result - how many answers were right, out of how many
 */
export async function saveQuizResult(lessonId: string, result: QuizResult): Promise<void> {
	const current = get(progressStore);
	await saveProgress({ ...current, quizResults: { ...current.quizResults, [lessonId]: result } });
}

/**
 * Remembers the chosen theme.
 * @param theme - "light", "dark" or "system"
 */
export async function saveThemeChoice(theme: ThemeChoice): Promise<void> {
	await saveProgress({ ...get(progressStore), theme });
}

/**
 * Remembers the terminal's text size.
 * @param fontSize - the size in pixels, or null to go back to the design's size
 */
export async function saveTerminalFontSize(fontSize: number | null): Promise<void> {
	await saveProgress({ ...get(progressStore), terminalFontSize: fontSize });
}

/**
 * Remembers whether the files desk is folded away.
 * @param isFolded - true when folded
 */
export async function saveFilesDeskFolded(isFolded: boolean): Promise<void> {
	await saveProgress({ ...get(progressStore), isFilesDeskFolded: isFolded });
}

/**
 * Remembers the lesson text size from Settings.
 * @param textSize - the size in pixels, or null for the design's size
 */
export async function saveLessonTextSize(textSize: number | null): Promise<void> {
	await saveProgress({ ...get(progressStore), lessonTextSize: textSize });
}

/**
 * Remembers the app's own "Reduce motion" switch.
 * @param isReduced - true when the student turned motion off
 */
export async function saveMotionReduced(isReduced: boolean): Promise<void> {
	await saveProgress({ ...get(progressStore), isMotionReduced: isReduced });
}

/**
 * Remembers the panel sizes the student dragged on the lesson screen.
 * @param sizes - the lesson column's and the terminal's share in percent (null = default)
 */
export async function savePanelSizes(
	sizes: Partial<Pick<ProgressData, 'lessonColumnShare' | 'terminalShare'>>
): Promise<void> {
	await saveProgress({ ...get(progressStore), ...sizes });
}

/**
 * Remembers which path the student follows.
 * @param pathId - "pro-path" or "book-path"
 */
export async function saveChosenPath(pathId: CoursePathId): Promise<void> {
	await saveProgress({ ...get(progressStore), chosenPathId: pathId });
}

/**
 * Remembers the lesson the student opened last, for "Pick up where you left off".
 * @param lessonId - the lesson on screen
 */
export async function saveLessonOpened(lessonId: string): Promise<void> {
	const current = get(progressStore);
	if (current.lastOpenedLessonId === lessonId) {
		return;
	}
	await saveProgress({ ...current, lastOpenedLessonId: lessonId });
}

/**
 * Remembers that a reading layer was opened, if it is deeper than any opened before.
 * @param lessonId - the lesson
 * @param layerId - the layer just opened
 */
export async function saveLayerRead(lessonId: string, layerId: LessonLayerId): Promise<void> {
	const current = get(progressStore);
	if (!isFurtherLayer(layerId, current.furthestLayers[lessonId])) {
		return;
	}
	await saveProgress({
		...current,
		furthestLayers: { ...current.furthestLayers, [lessonId]: layerId }
	});
}

/** Forgets missions, quiz results and reading places (screen choices like the theme stay). */
export async function resetProgress(): Promise<void> {
	const current = get(progressStore);
	await saveProgress({
		...emptyProgress,
		theme: current.theme,
		terminalFontSize: current.terminalFontSize,
		isFilesDeskFolded: current.isFilesDeskFolded,
		chosenPathId: current.chosenPathId,
		lessonTextSize: current.lessonTextSize,
		isMotionReduced: current.isMotionReduced,
		lessonColumnShare: current.lessonColumnShare,
		terminalShare: current.terminalShare
	});
}

/**
 * Updates the store and writes it to storage.
 * @param newProgress - the full new progress
 */
async function saveProgress(newProgress: ProgressData): Promise<void> {
	progressStore.set(newProgress);
	await storage.set(progressKey, newProgress);
	await storage.save();
}

/**
 * Opens the Tauri store in the desktop app, or memory storage in a plain browser.
 * @returns the storage
 */
async function openDefaultStorage(): Promise<KeyValueStorage> {
	if (!isTauri()) {
		return createMemoryStorage();
	}
	const { load } = await import('@tauri-apps/plugin-store');
	return load(storeFileName, { autoSave: false, defaults: {} });
}

/**
 * Builds a storage that only lives in memory (used outside the desktop app and before loading).
 * @returns the storage
 */
export function createMemoryStorage(): KeyValueStorage {
	const values = new Map<string, unknown>();
	return {
		get: <Value>(key: string) => Promise.resolve(values.get(key) as Value | undefined),
		set: (key, value) => {
			values.set(key, value);
			return Promise.resolve();
		},
		save: () => Promise.resolve()
	};
}
