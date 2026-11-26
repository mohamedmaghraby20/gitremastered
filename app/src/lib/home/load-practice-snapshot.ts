/**
 * load-practice-snapshot.ts
 * Reads a lesson's practice repository for the home screen, without building or changing it.
 * Outside the desktop app (a plain browser, tests) there is no repository, so it gives null.
 */

import { isTauri } from '@tauri-apps/api/core';
import { findPracticeRepo, getRepoSnapshot } from '$lib/tauri/commands';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Loads the state of a lesson's practice repository.
 * @param lessonId - the lesson (its ID names the practice folder)
 * @returns the snapshot, or null when the folder was never built, the app runs outside the
 *          desktop window, or the folder could not be read
 */
export async function loadPracticeSnapshot(lessonId: string): Promise<RepoSnapshot | null> {
	if (!isTauri()) {
		return null;
	}
	try {
		const folderPath = await findPracticeRepo(lessonId);
		return folderPath === null ? null : await getRepoSnapshot(folderPath);
	} catch {
		// The preview is a nice extra: a broken or locked folder simply shows no preview.
		return null;
	}
}
