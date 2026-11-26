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

describe('course links', () => {
	it('turn into app links with their kind and ID', () => {
		expect(renderInlineMarkdown('On [**branch**](term:branch) main')).toBe(
			'On <a href="/commands/terms#branch" class="course-link" data-link-kind="term" data-link-id="branch"><strong>branch</strong></a> main'
		);
		expect(renderMarkdown('See [.gitignore](lesson:ignoring-files).')).toContain(
			'<a href="/lessons/ignoring-files" class="course-link" data-link-kind="lesson" data-link-id="ignoring-files">.gitignore</a>'
		);
	});

	it('leave ordinary links as they are', () => {
		expect(renderInlineMarkdown('[Pro Git](https://git-scm.com)')).toBe(
			'<a href="https://git-scm.com">Pro Git</a>'
		);
	});
});
