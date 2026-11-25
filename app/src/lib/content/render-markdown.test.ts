/**
 * render-markdown.test.ts
 * Tests for turning lesson Markdown into HTML.
 */

import { describe, expect, it } from 'vitest';
import { renderInlineMarkdown, renderMarkdown } from './render-markdown.ts';

describe('renderMarkdown', () => {
	it('turns paragraphs and inline code into HTML', () => {
		expect(renderMarkdown('Run `git status`.')).toBe('<p>Run <code>git status</code>.</p>\n');
	});

	it('keeps numbered lists as ordered lists', () => {
		expect(renderMarkdown('1. One\n2. Two')).toContain('<ol>');
	});
});

describe('renderInlineMarkdown', () => {
	it('renders inline code without a paragraph around it', () => {
		expect(renderInlineMarkdown('Run `git add`')).toBe('Run <code>git add</code>');
	});
});
