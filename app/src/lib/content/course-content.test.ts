/**
 * course-content.test.ts
 * Checks the real content/ folder: it loads without errors (so a broken lesson fails the tests)
 * and the pilot lesson has what the pilot needs.
 */

import { describe, expect, it } from 'vitest';
import { courseContent, getLesson } from './course-content.ts';
import { findReadingMinutes, findSourceLabel } from './lesson-facts.ts';

/**
 * Counts the words in a piece of Markdown.
 * @param markdownText - any text
 * @returns the number of words
 */
function countWords(markdownText: string): number {
	return markdownText.split(/\s+/).filter((word) => word !== '').length;
}

describe('courseContent', () => {
	it('loads the pilot lesson with its mission and quiz', () => {
		const pilotLesson = getLesson('three-areas');
		expect(pilotLesson?.title).toBe('Status, stage, commit: the three areas');
		expect(pilotLesson?.mission.hints).toHaveLength(3);
		expect(pilotLesson?.quiz.questions).toHaveLength(3);
	});

	it('keeps the pilot\'s "Must know" layer complete but readable in 10 to 15 minutes', () => {
		const mustKnowWordCount = countWords(getLesson('three-areas')?.sections.mustKnow ?? '');
		expect(mustKnowWordCount).toBeGreaterThan(600);
		expect(mustKnowWordCount).toBeLessThan(2600);
	});

	it('lists the pilot in the Book path under Pro Git 2.2', () => {
		const sectionTwoTwo = courseContent.bookPath?.chapters[0].sections[0];
		expect(sectionTwoTwo?.number).toBe('2.2');
		expect(sectionTwoTwo?.lessonIds).toContain('three-areas');
	});

	it('gives the pilot a reading time of 5 to 15 minutes and a Pro Git source label', () => {
		const pilotLesson = getLesson('three-areas');
		if (pilotLesson === undefined) {
			throw new Error('the pilot lesson is missing');
		}
		expect(findReadingMinutes(pilotLesson)).toBeGreaterThanOrEqual(5);
		expect(findReadingMinutes(pilotLesson)).toBeLessThanOrEqual(15);
		expect(findSourceLabel(pilotLesson)).toBe('Pro Git 2.2');
	});

	it('lists the pilot in the pro path', () => {
		const proPath = courseContent.paths.get('pro-path');
		expect(proPath?.modules[0].lessonIds).toContain('three-areas');
	});

	it('returns nothing for an unknown lesson ID', () => {
		expect(getLesson('no-such-lesson')).toBeUndefined();
	});
});
