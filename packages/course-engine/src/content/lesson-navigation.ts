/**
 * lesson-navigation.ts
 * Works out where a lesson sits in a learning path: its number, its module's title and the
 * lessons before and after it (for the eyebrow and the Previous / Next links).
 */

import type { LearningPath } from '../types/learning-path.ts';

/** A link to another lesson. */
export type LessonLink = {
	id: string;
	title: string;
	lessonNumber: number; // its position in the path, starting at 1
};

/** Where one lesson sits in a path. */
export type LessonPlace = {
	lessonNumber: number;
	moduleTitle: string;
	previousLesson: LessonLink | null; // null on the first lesson
	nextLesson: LessonLink | null; // null on the last lesson
};

/**
 * Finds a lesson's place in a path.
 * @param learningPath - the path, e.g. the pro path
 * @param lessonTitles - every lesson's title, keyed by lesson ID
 * @param lessonId - the lesson to find
 * @returns its place, or undefined if the path does not list it
 */
export function findLessonPlace(
	learningPath: LearningPath,
	lessonTitles: Map<string, string>,
	lessonId: string
): LessonPlace | undefined {
	const orderedLessons = learningPath.modules.flatMap((pathModule) =>
		pathModule.lessonIds.map((id) => ({ id, moduleTitle: pathModule.title }))
	);
	const position = orderedLessons.findIndex((entry) => entry.id === lessonId);
	if (position === -1) {
		return undefined;
	}

	/**
	 * Builds the link for the lesson at a position, if there is one.
	 * @param linkPosition - an index into orderedLessons
	 * @returns the link, or null outside the path
	 */
	const linkAt = (linkPosition: number): LessonLink | null => {
		const entry = orderedLessons[linkPosition];
		if (entry === undefined) {
			return null;
		}
		const title = lessonTitles.get(entry.id) ?? entry.id;
		return { id: entry.id, title, lessonNumber: linkPosition + 1 };
	};

	return {
		lessonNumber: position + 1,
		moduleTitle: orderedLessons[position].moduleTitle,
		previousLesson: linkAt(position - 1),
		nextLesson: linkAt(position + 1)
	};
}

/**
 * Writes a lesson number the way the course map does.
 * @param lessonNumber - e.g. 5
 * @returns at least two digits, e.g. "05"
 */
export function formatLessonNumber(lessonNumber: number): string {
	return String(lessonNumber).padStart(2, '0');
}
