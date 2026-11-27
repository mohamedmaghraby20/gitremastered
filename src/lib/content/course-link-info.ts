/**
 * course-link-info.ts
 * What a course link's hover card says and where clicking the link goes:
 * - a lesson link: the lesson's title and lede; it opens the lesson;
 * - a term link: the term and its meaning; it opens the first lesson that teaches the term,
 *   or, when no written lesson teaches it yet, the term in the glossary ("Coming later").
 */

import { getLesson, listGlossaryTerms } from './course-content';
import type { CourseLink } from '@gitremastered/course-engine/content/course-links';
import { courseLinkFallbackHref } from '@gitremastered/course-engine/content/course-links';
import { toPlainText } from '$lib/search/search-index';

/** The hover card's text and the link's destination. */
export type CourseLinkInfo = {
	title: string;
	text: string; // one or two plain sentences
	actionText: string; // what clicking does, e.g. "Click to open: Ignore files with .gitignore"
	destinationHref: string; // the app address the click opens
	destinationLessonId: string | null; // the lesson it opens, if it opens one
};

/**
 * Describes a course link.
 * @param link - the link's kind and ID (the content check already made sure the ID exists)
 * @returns the card's text and the destination
 */
export function describeCourseLink(link: CourseLink): CourseLinkInfo {
	if (link.kind === 'lesson') {
		const lesson = getLesson(link.id);
		return {
			title: lesson?.title ?? link.id,
			text: toPlainText(lesson?.lede ?? ''),
			actionText: 'Click to open this lesson.',
			destinationHref: courseLinkFallbackHref(link),
			destinationLessonId: link.id
		};
	}
	const term = listGlossaryTerms().find((glossaryTerm) => glossaryTerm.id === link.id);
	const teachingLesson = term?.lessonIds.map((lessonId) => getLesson(lessonId)).find(Boolean);
	if (teachingLesson === undefined) {
		return {
			title: term?.term ?? link.id,
			text: toPlainText(term?.meaning ?? ''),
			actionText: 'Coming later: no lesson teaches this yet. Click for the glossary.',
			destinationHref: courseLinkFallbackHref(link),
			destinationLessonId: null
		};
	}
	return {
		title: term?.term ?? link.id,
		text: toPlainText(term?.meaning ?? ''),
		actionText: `Click to open the lesson: ${teachingLesson.title}`,
		destinationHref: `/lessons/${teachingLesson.id}`,
		destinationLessonId: teachingLesson.id
	};
}
