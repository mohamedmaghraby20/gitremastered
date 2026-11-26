/**
 * learning-summary.ts
 * Pure functions that answer "where is the student?" from saved progress and the path files:
 * the lesson to continue, the lessons up next, how far along a path is, and which reading
 * layer is further. Home, the course map and the sidebar use them; none of them saves anything.
 * A lesson counts as done when its mission is finished (the sidebar's ✓ uses the same rule).
 */

import type { BookPath } from '$lib/types/book-path';
import type { LearningPath } from '$lib/types/learning-path';
import { lessonLayerIds, type LessonLayerId } from '$lib/types/lesson';

/** The parts of saved progress these functions read. */
export type StudentPlace = {
	finishedMissions: string[];
	lastOpenedLessonId: string | null;
};

/** How far along a list of lessons the student is. */
export type PathProgress = { doneCount: number; totalCount: number };

/** The core course is the first six modules of the pro path (course map modules 0 to 5). */
export const coreModuleCount = 6;

/**
 * Lists every lesson of a modules path, in order.
 * @param learningPath - e.g. the pro path
 * @returns the lesson IDs, module after module
 */
export function listPathLessonIds(learningPath: LearningPath): string[] {
	return learningPath.modules.flatMap((pathModule) => pathModule.lessonIds);
}

/**
 * Lists every lesson of the Book path in chapter order. A lesson that teaches several sections
 * appears once, where it first appears.
 * @param bookPath - the Book path
 * @returns the lesson IDs
 */
export function listBookPathLessonIds(bookPath: BookPath): string[] {
	const sectionLessonIds = bookPath.chapters.flatMap((chapter) =>
		chapter.sections.flatMap((section) => section.lessonIds)
	);
	return [...new Set(sectionLessonIds)];
}

/**
 * Lists the lessons of the core modules.
 * @param proPath - the pro path
 * @param moduleCount - how many modules count as core (the course's own number by default)
 * @returns the lesson IDs of the first modules
 */
export function listCoreLessonIds(proPath: LearningPath, moduleCount = coreModuleCount): string[] {
	const coreModules = proPath.modules.slice(0, moduleCount);
	return listPathLessonIds({ ...proPath, modules: coreModules });
}

/**
 * Finds the lesson to continue: the last one opened, if it is still in the path.
 * @param student - the saved progress
 * @param pathLessonIds - the lessons of the chosen path, in order
 * @returns the lesson ID, or null for a student who has not opened a lesson yet
 */
export function findContinueLessonId(
	student: StudentPlace,
	pathLessonIds: string[]
): string | null {
	const lastLessonId = student.lastOpenedLessonId;
	if (lastLessonId === null || !pathLessonIds.includes(lastLessonId)) {
		return null;
	}
	return lastLessonId;
}

/**
 * Lists the next unfinished lessons: first the ones after the current lesson, then any earlier
 * ones the student skipped.
 * @param student - the saved progress
 * @param pathLessonIds - the lessons of the chosen path, in order
 * @param count - how many to list at most
 * @returns up to `count` lesson IDs, never the current lesson
 */
export function findUpNextLessonIds(
	student: StudentPlace,
	pathLessonIds: string[],
	count: number
): string[] {
	const currentLessonId = findContinueLessonId(student, pathLessonIds);
	const startIndex = currentLessonId === null ? 0 : pathLessonIds.indexOf(currentLessonId) + 1;
	const lessonsInReadingOrder = [
		...pathLessonIds.slice(startIndex),
		...pathLessonIds.slice(0, startIndex)
	];
	return lessonsInReadingOrder
		.filter((lessonId) => lessonId !== currentLessonId)
		.filter((lessonId) => !student.finishedMissions.includes(lessonId))
		.slice(0, count);
}

/**
 * Counts how many of the given lessons are done.
 * @param student - the saved progress
 * @param lessonIds - the lessons to count, e.g. a whole path or the core modules
 * @returns done and total counts
 */
export function countPathProgress(student: StudentPlace, lessonIds: string[]): PathProgress {
	const doneCount = lessonIds.filter((lessonId) =>
		student.finishedMissions.includes(lessonId)
	).length;
	return { doneCount, totalCount: lessonIds.length };
}

/**
 * Tells whether a layer is further into a lesson than the furthest one read so far.
 * @param layerId - the layer just opened
 * @param furthestLayerId - the furthest layer read before, or undefined if none
 * @returns true when layerId comes later (Must know, then Under the hood, then Advanced)
 */
export function isFurtherLayer(
	layerId: LessonLayerId,
	furthestLayerId: LessonLayerId | undefined
): boolean {
	if (furthestLayerId === undefined) {
		return true;
	}
	return lessonLayerIds.indexOf(layerId) > lessonLayerIds.indexOf(furthestLayerId);
}
