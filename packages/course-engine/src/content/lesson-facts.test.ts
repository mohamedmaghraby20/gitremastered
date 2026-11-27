/**
 * lesson-facts.test.ts
 * Tests for the two facts shown in lesson lists: reading time and source label.
 */

import { describe, expect, it } from 'vitest';
import { findReadingMinutes, findSourceLabel } from './lesson-facts.ts';

/**
 * Makes a text with a given number of words.
 * @param wordCount - how many words
 * @returns the words, separated by spaces
 */
function wordsOfLength(wordCount: number): string {
	return Array.from({ length: wordCount }, () => 'word').join(' ');
}

describe('findReadingMinutes', () => {
	it('counts the Must know text and the first challenge brief at 200 words a minute', () => {
		const facts = {
			sections: { mustKnow: wordsOfLength(1990) },
			challenges: [{ brief: wordsOfLength(10) }]
		};
		expect(findReadingMinutes(facts)).toBe(10);
	});

	it('rounds to the nearest minute', () => {
		const facts = { sections: { mustKnow: wordsOfLength(1350) }, challenges: [{ brief: '' }] };
		expect(findReadingMinutes(facts)).toBe(7);
	});

	it('never says less than one minute', () => {
		const facts = { sections: { mustKnow: 'Short.' }, challenges: [{ brief: '' }] };
		expect(findReadingMinutes(facts)).toBe(1);
	});
});

describe('findSourceLabel', () => {
	it('names the Pro Git section number for book lessons', () => {
		const lesson = {
			bookSection: '2.2 Recording Changes to the Repository',
			bookUrl: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository'
		};
		expect(findSourceLabel(lesson)).toBe('Pro Git 2.2');
	});

	it('says "Beyond the book" for lessons from other sources, like GitHub Docs', () => {
		const lesson = {
			bookSection: 'GitHub Docs: About pull requests',
			bookUrl: 'https://docs.github.com/en/pull-requests'
		};
		expect(findSourceLabel(lesson)).toBe('Beyond the book');
	});
});
