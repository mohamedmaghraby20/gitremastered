/**
 * parse-book-path.ts
 * Reads the Book path file (content/paths/book-path.yaml): Pro Git chapters, their sections,
 * and the lessons that teach each section.
 */

import type { BookChapter, BookPath, BookSection } from '../types/book-path.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads the whole Book path file.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the typed Book path
 * @throws ContentError naming the file and the problem
 */
export function parseBookPathText(fileText: string, fileName: string): BookPath {
	const reader = FieldReader.fromYaml(fileText, fileName);
	return {
		id: reader.text('id'),
		title: reader.text('title'),
		chapters: reader.recordList('chapters', 'chapter').map(readBookChapter)
	};
}

/**
 * Reads one chapter and its sections.
 * @param chapterReader - a reader for one item of "chapters"
 * @returns the typed chapter
 */
function readBookChapter(chapterReader: FieldReader): BookChapter {
	const chapterNumber = chapterReader.wholeNumber('number');
	const sectionReaders = chapterReader.recordList('sections', 'section');
	return {
		number: chapterNumber,
		title: chapterReader.text('title'),
		sections: sectionReaders.map((sectionReader) => readBookSection(sectionReader, chapterNumber))
	};
}

/**
 * Reads one section, checking that its number belongs to its chapter ("2.2" in chapter 2).
 * @param sectionReader - a reader for one item of "sections"
 * @param chapterNumber - the chapter the section sits in
 * @returns the typed section
 */
function readBookSection(sectionReader: FieldReader, chapterNumber: number): BookSection {
	const sectionNumber = sectionReader.text('number');
	if (!sectionNumber.startsWith(`${chapterNumber}.`)) {
		sectionReader.fail(`section "${sectionNumber}" is not in chapter ${chapterNumber}`);
	}
	return {
		number: sectionNumber,
		title: sectionReader.text('title'),
		lessonIds: sectionReader.textList('lessons')
	};
}
