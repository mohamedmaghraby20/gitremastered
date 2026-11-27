/**
 * parse-reference.ts
 * Reads the command index's content: one command page (content/commands/<id>.md, frontmatter
 * plus a Markdown body with the usual lesson blocks) and the glossary (content/glossary.yaml).
 */

import type { CommandPage, GlossaryTerm } from '../types/reference.ts';
import { FieldReader } from './field-reader.ts';
import { readBookUrl, splitFrontmatter } from './parse-lesson.ts';
import { splitIntoBlocks } from './render-blocks.ts';
import { ContentError } from './content-error.ts';

/**
 * Reads one command page.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the typed command page
 * @throws ContentError naming the file and the problem
 */
export function parseCommandPageText(fileText: string, fileName: string): CommandPage {
	const unixText = fileText.replaceAll('\r\n', '\n');
	const { frontmatterText, bodyText } = splitFrontmatter(unixText, fileName);
	const reader = FieldReader.fromYaml(frontmatterText, fileName);
	const body = bodyText.trim();
	if (body === '') {
		throw new ContentError(fileName, 'the explanation after the frontmatter is empty');
	}
	// Reading the blocks now makes a broken block fail the content check, not the page.
	splitIntoBlocks(body, fileName);
	return {
		id: reader.text('id'),
		command: reader.text('command'),
		group: reader.text('group'),
		summary: reader.text('summary'),
		usage: reader.textList('usage'),
		bookSection: reader.text('bookSection'),
		bookUrl: readBookUrl(reader),
		lessonIds: reader.textList('lessons', 0),
		body
	};
}

/**
 * Reads the glossary file.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the terms, in file order
 * @throws ContentError naming the file, the term and the problem
 */
export function parseGlossaryText(fileText: string, fileName: string): GlossaryTerm[] {
	const reader = FieldReader.fromYaml(fileText, fileName);
	return reader.recordList('terms', 'term').map((termReader) => ({
		id: termReader.text('id'),
		term: termReader.text('term'),
		meaning: termReader.text('meaning'),
		lessonIds: termReader.textList('lessons', 0)
	}));
}
