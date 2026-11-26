/**
 * load-reference.ts
 * Loads the command index's content from the raw files of content/: every command page
 * (commands/<id>.md) and the glossary (glossary.yaml), and checks the lessons they name.
 */

import type { Lesson } from '../types/lesson.ts';
import type { CommandPage, GlossaryTerm } from '../types/reference.ts';
import { checkLessonsExist } from './check-lesson-ids.ts';
import { ContentError } from './content-error.ts';
import { parseCommandPageText, parseGlossaryText } from './parse-reference.ts';

/** Content files keyed by their path inside content/ (the same shape load-lessons uses). */
type ContentFiles = Record<string, string>;

/** The glossary's file inside content/. */
const glossaryFile = 'glossary.yaml';

/**
 * Loads every command page, keyed by ID, in file-name order.
 * @param contentFiles - the files of content/
 * @param lessons - the loaded lessons, to check "lessons" fields
 * @returns the command pages
 * @throws ContentError for the first broken page
 */
export function loadCommandPages(
	contentFiles: ContentFiles,
	lessons: Map<string, Lesson>
): Map<string, CommandPage> {
	const commandPages = new Map<string, CommandPage>();
	const commandFiles = Object.keys(contentFiles)
		.filter((relativePath) => /^commands\/[^/]+\.md$/.test(relativePath))
		.sort();
	for (const relativePath of commandFiles) {
		const fileName = `content/${relativePath}`;
		const commandPage = parseCommandPageText(contentFiles[relativePath], fileName);
		const expectedId = relativePath.slice('commands/'.length, -'.md'.length);
		if (commandPage.id !== expectedId) {
			const problem = `the id "${commandPage.id}" must match the file name "${expectedId}"`;
			throw new ContentError(fileName, problem);
		}
		checkLessonsExist(commandPage.lessonIds, lessons, fileName, `command "${commandPage.id}"`);
		commandPages.set(commandPage.id, commandPage);
	}
	return commandPages;
}

/**
 * Loads the glossary, if its file exists, and checks its terms.
 * @param contentFiles - the files of content/
 * @param lessons - the loaded lessons, to check "lessons" fields
 * @returns the terms in file order (none without the file)
 * @throws ContentError for a broken term, an unknown lesson or a repeated ID
 */
export function loadGlossary(
	contentFiles: ContentFiles,
	lessons: Map<string, Lesson>
): GlossaryTerm[] {
	const fileText = contentFiles[glossaryFile];
	if (fileText === undefined) {
		return [];
	}
	const fileName = `content/${glossaryFile}`;
	const terms = parseGlossaryText(fileText, fileName);
	const seenIds = new Set<string>();
	for (const term of terms) {
		if (seenIds.has(term.id)) {
			throw new ContentError(fileName, `the term id "${term.id}" is used twice`);
		}
		seenIds.add(term.id);
		checkLessonsExist(term.lessonIds, lessons, fileName, `term "${term.id}"`);
	}
	return terms;
}
