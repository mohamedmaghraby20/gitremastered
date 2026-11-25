/**
 * render-markdown.ts
 * Turns lesson Markdown into HTML with the "marked" library.
 * Only our own content files go through here (bundled at build time), never text from outside.
 */

import { marked } from 'marked';

/**
 * Converts Markdown to HTML.
 * @param markdownText - Markdown from a lesson file
 * @returns the HTML
 */
export function renderMarkdown(markdownText: string): string {
	return marked.parse(markdownText, { async: false, gfm: true });
}

/**
 * Converts one line of Markdown (like the lede) to HTML, without wrapping it in a paragraph.
 * @param markdownText - one line of Markdown
 * @returns the HTML
 */
export function renderInlineMarkdown(markdownText: string): string {
	return marked.parseInline(markdownText, { async: false, gfm: true });
}
