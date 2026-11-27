/**
 * parse-book-path.test.ts
 * Tests for reading the Book path file: Pro Git chapters, their sections, and the lessons.
 */

import { describe, expect, it } from 'vitest';
import { parseBookPathText } from './parse-book-path.ts';

const fileName = 'content/paths/book-path.yaml';
const validBookPathText = `id: book-path
title: Book path
chapters:
  - number: 2
    title: Git Basics
    sections:
      - number: "2.2"
        title: Recording Changes to the Repository
        lessons: [three-areas, ignoring-files]
`;

describe('parseBookPathText', () => {
	it('reads chapters, sections and their lessons', () => {
		expect(parseBookPathText(validBookPathText, fileName)).toEqual({
			id: 'book-path',
			title: 'Book path',
			chapters: [
				{
					number: 2,
					title: 'Git Basics',
					sections: [
						{
							number: '2.2',
							title: 'Recording Changes to the Repository',
							lessonIds: ['three-areas', 'ignoring-files']
						}
					]
				}
			]
		});
	});

	it('rejects a section numbered for another chapter', () => {
		const wrongNumber = validBookPathText.replace('"2.2"', '"3.2"');
		expect(() => parseBookPathText(wrongNumber, fileName)).toThrow(
			'section "3.2" is not in chapter 2'
		);
	});

	it('rejects a section with no lessons', () => {
		const noLessons = validBookPathText.replace(
			'        lessons: [three-areas, ignoring-files]\n',
			''
		);
		expect(() => parseBookPathText(noLessons, fileName)).toThrow('"lessons" field is missing');
	});
});
