/**
 * course-links.ts
 * Links inside the course's own text, written in plain Markdown with a special address:
 *   [branch](term:branch)                  a glossary term
 *   [.gitignore](lesson:ignoring-files)    another lesson
 * This file reads those addresses; the renderer turns them into real links, the content check
 * rejects unknown IDs, and the lesson screen shows a hover card for each.
 */

/** One course link: what it points at. */
export type CourseLink = { kind: 'term' | 'lesson'; id: string };

/** The address pattern: "term:" or "lesson:" followed by an ID like "staging-area". */
const courseLinkAddress = /^(term|lesson):([a-z0-9][a-z0-9-]*)$/;

/**
 * Reads a link address.
 * @param href - the address written in the Markdown link, e.g. "term:branch"
 * @returns the course link, or null for an ordinary address like "https://…"
 */
export function parseCourseLink(href: string): CourseLink | null {
	const match = courseLinkAddress.exec(href);
	if (match === null) {
		return null;
	}
	return { kind: match[1] === 'term' ? 'term' : 'lesson', id: match[2] };
}

/**
 * Finds every course link in a piece of Markdown, for the content check.
 * @param markdown - lesson or command page Markdown
 * @returns the links, in the order they appear
 */
export function findCourseLinks(markdown: string): CourseLink[] {
	const links: CourseLink[] = [];
	for (const match of markdown.matchAll(/\]\(((?:term|lesson):[^)\s]+)\)/g)) {
		const link = parseCourseLink(match[1]);
		if (link !== null) {
			links.push(link);
		}
	}
	return links;
}

/**
 * The app address a course link opens when nothing better is known (no JavaScript, tests):
 * a lesson's page, or the term in the glossary.
 * @param link - the course link
 * @returns the address, like "/lessons/ignoring-files" or "/commands/terms#branch"
 */
export function courseLinkFallbackHref(link: CourseLink): string {
	return link.kind === 'lesson' ? `/lessons/${link.id}` : `/commands/terms#${link.id}`;
}
