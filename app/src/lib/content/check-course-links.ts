/**
 * check-course-links.ts
 * Content check for links between lessons: every [text](term:id) must name a glossary term and
 * every [text](lesson:id) a lesson that exists, so a typo fails the build instead of leaving a
 * dead link in a lesson.
 */

import type { Lesson } from '../types/lesson.ts';
import type { CommandPage, GlossaryTerm } from '../types/reference.ts';
import { ContentError } from './content-error.ts';
import { findCourseLinks } from './course-links.ts';

/**
 * Checks the course links in every lesson and command page.
 * @param lessons - the loaded lessons
 * @param commandPages - the loaded command pages
 * @param glossary - the loaded glossary terms
 * @throws ContentError naming the file and the unknown ID
 */
export function checkCourseLinks(
	lessons: Map<string, Lesson>,
	commandPages: Map<string, CommandPage>,
	glossary: GlossaryTerm[]
): void {
	const termIds = new Set(glossary.map((term) => term.id));
	for (const lesson of lessons.values()) {
		const lessonText = [lesson.lede, ...Object.values(lesson.sections)].join('\n');
		checkLinksInText(lessonText, `content/lessons/${lesson.id}/lesson.md`, lessons, termIds);
	}
	for (const commandPage of commandPages.values()) {
		checkLinksInText(commandPage.body, `content/commands/${commandPage.id}.md`, lessons, termIds);
	}
}

/**
 * Checks the course links in one file's text.
 * @param text - the file's Markdown
 * @param fileName - the file, for error messages
 * @param lessons - the loaded lessons
 * @param termIds - every glossary term ID
 */
function checkLinksInText(
	text: string,
	fileName: string,
	lessons: Map<string, Lesson>,
	termIds: Set<string>
): void {
	for (const link of findCourseLinks(text)) {
		if (link.kind === 'term' && !termIds.has(link.id)) {
			throw new ContentError(fileName, `the link "term:${link.id}" names no glossary term`);
		}
		if (link.kind === 'lesson' && !lessons.has(link.id)) {
			throw new ContentError(fileName, `the link "lesson:${link.id}" names no lesson`);
		}
	}
}
