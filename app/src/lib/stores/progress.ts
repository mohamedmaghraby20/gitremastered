/**
 * progress.ts
 * The one module that saves and loads the student's progress: finished missions, quiz
 * results, the chosen theme, the terminal's text size and whether the files desk is folded. In the desktop app it uses the Tauri store plugin (a small
 * JSON file in the app's data folder); in a plain browser it keeps progress in memory only.
 * Screens read the `progress` store and call the functions below; nothing else touches storage.
 */

import { writable, get, type Readable } from 'svelte/store';
import { isTauri } from '@tauri-apps/api/core';
import type { ThemeChoice } from '$lib/theme/theme';

/** One saved quiz result. */
export type QuizResult = { correctCount: number; questionCount: number };

/** Everything the app remembers between sessions. */
export type ProgressData = {
	finishedMissions: string[]; // lesson IDs whose mission was completed
	quizResults: Record<string, QuizResult>; // by lesson ID, the latest result
	theme: ThemeChoice;
	terminalFontSize: number | null; // pixels, chosen with Ctrl + / -; null = the design's size
	isFilesDeskFolded: boolean; // the student folded the visualizer's files desk away
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
	quizResults: {},
	theme: 'system',
	terminalFontSize: null,
	isFilesDeskFolded: false
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

/** Forgets finished missions and quiz results (screen choices like the theme stay). */
export async function resetProgress(): Promise<void> {
	const current = get(progressStore);
	await saveProgress({
		...emptyProgress,
		theme: current.theme,
		terminalFontSize: current.terminalFontSize,
		isFilesDeskFolded: current.isFilesDeskFolded
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
