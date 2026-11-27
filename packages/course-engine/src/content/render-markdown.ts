/**
 * render-markdown.ts
 * Turns lesson Markdown into HTML with the "marked" library.
 * Only our own content files go through here (bundled at build time), never text from outside.
 * Course links ([branch](term:branch), [.gitignore](lesson:ignoring-files)) become real links
 * marked with data-link-kind and data-link-id, so the lesson screen can show their hover card.
 */

import { Marked, type Tokens } from 'marked';
import { courseLinkFallbackHref, parseCourseLink } from './course-links.ts';

/** Our own Marked setup, so its course-link renderer never changes other uses of marked. */
const courseMarked = new Marked({
	gfm: true,
	renderer: {
		/**
		 * Writes a link: course links get their app address and data attributes,
		 * other links are left to marked's own renderer.
		 * @param link - the link token
		 * @returns the link's HTML, or false to use the default renderer
		 */
		link(link: Tokens.Link): string | false {
			const courseLink = parseCourseLink(link.href);
			if (courseLink === null) {
				return false;
			}
			const linkText = this.parser.parseInline(link.tokens);
			return (
				`<a href="${courseLinkFallbackHref(courseLink)}" class="course-link" ` +
				`data-link-kind="${courseLink.kind}" data-link-id="${courseLink.id}">${linkText}</a>`
			);
		}
	}
});

/**
 * Converts Markdown to HTML.
 * @param markdownText - Markdown from a lesson file
 * @returns the HTML
 */
export function renderMarkdown(markdownText: string): string {
	return courseMarked.parse(markdownText, { async: false });
}

/**
 * Converts one line of Markdown (like the lede) to HTML, without wrapping it in a paragraph.
 * @param markdownText - one line of Markdown
 * @returns the HTML
 */
export function renderInlineMarkdown(markdownText: string): string {
	return courseMarked.parseInline(markdownText, { async: false });
}
