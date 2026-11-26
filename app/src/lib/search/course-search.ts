/**
 * course-search.ts
 * The search index for the real course, built once when the app starts from the content it
 * already loaded. The search box, the Ctrl K panel and the search page all use it.
 */

import {
	courseContent,
	getBookPath,
	getLessonCard,
	listCommandPages,
	listGlossaryTerms
} from '$lib/content/course-content';
import { buildSearchIndex, type SearchItem } from './search-index';

/**
 * Collects the course's content and builds the index.
 * @returns every searchable item
 */
function buildCourseSearchIndex(): SearchItem[] {
	const lessons = [...courseContent.lessons.values()].map((lesson) => ({
		lesson,
		numberLabel: getLessonCard(lesson.id)?.numberLabel ?? null
	}));
	const lessonTitles = new Map(lessons.map(({ lesson }) => [lesson.id, lesson.title]));
	return buildSearchIndex({
		lessons,
		commands: listCommandPages(),
		terms: listGlossaryTerms(),
		bookPath: getBookPath(),
		lessonTitles
	});
}

/** The course's search index. */
export const courseSearchIndex: SearchItem[] = buildCourseSearchIndex();
