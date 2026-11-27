/**
 * +page.ts (one lesson, "/lessons/<lessonId>")
 * Looks up the lesson named in the address and its place in the pro path.
 * An unknown ID gives lesson = null, and the page shows "Lesson not found".
 */

import type { PageLoad } from './$types';
import { getLesson, getLessonPlace } from '$lib/content/course-content';

/**
 * Loads the data the lesson page needs.
 * @param event - SvelteKit's load event; only params.lessonId is used
 * @returns the lesson ID from the address, the lesson (or null) and its place (or null)
 */
export const load: PageLoad = ({ params }) => {
	const lesson = getLesson(params.lessonId) ?? null;
	const place = lesson === null ? null : (getLessonPlace(lesson.id) ?? null);
	return { lessonId: params.lessonId, lesson, place };
};
