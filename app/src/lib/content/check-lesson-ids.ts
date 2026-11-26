/**
 * check-lesson-ids.ts
 * One check shared by every content file that names lessons (paths, command pages, glossary):
 * each named lesson must exist, so a typo fails the content check instead of a dead link.
 */

import type { Lesson } from '../types/lesson.ts';
import { ContentError } from './content-error.ts';

/**
 * Checks that every lesson ID names a loaded lesson.
 * @param lessonIds - the IDs to check
 * @param lessons - the loaded lessons
 * @param fileName - the file that names them, for error messages
 * @param place - where the IDs sit, like 'module "daily-loop"' or 'term "staging-area"'
 * @throws ContentError for the first unknown ID
 */
export function checkLessonsExist(
	lessonIds: string[],
	lessons: Map<string, Lesson>,
	fileName: string,
	place: string
): void {
	for (const lessonId of lessonIds) {
		if (!lessons.has(lessonId)) {
			throw new ContentError(fileName, `unknown lesson "${lessonId}" in ${place}`);
		}
	}
}
