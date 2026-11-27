/**
 * quick-review.test.ts
 * Tests for picking the home screen's daily review question.
 */

import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@gitremastered/course-engine/types/quiz';
import { findDayNumber, pickReviewQuestion } from './quick-review';

/**
 * Makes a quiz question with one right answer.
 * @param text - the question
 * @returns the question
 */
function question(text: string): QuizQuestion {
	return { question: text, answers: [{ text: 'Yes', isCorrect: true, explanation: 'Right.' }] };
}

const sources = [
	{ lessonId: 'three-areas', questions: [question('Q1'), question('Q2')] },
	{ lessonId: 'ignoring-files', questions: [question('Q3')] }
];

describe('pickReviewQuestion', () => {
	it('has nothing to review before any lesson', () => {
		expect(pickReviewQuestion([], 100)).toBeNull();
	});

	it('picks a different question each day, going through all of them', () => {
		const picks = [0, 1, 2, 3].map((dayNumber) => pickReviewQuestion(sources, dayNumber));
		expect(picks.map((pick) => pick?.question.question)).toEqual(['Q1', 'Q2', 'Q3', 'Q1']);
		expect(picks[2]?.lessonId).toBe('ignoring-files');
	});
});

describe('findDayNumber', () => {
	it('gives the same number all day and the next number the next day', () => {
		const morning = findDayNumber(new Date('2026-11-26T08:00:00Z'));
		const evening = findDayNumber(new Date('2026-11-26T22:00:00Z'));
		const nextDay = findDayNumber(new Date('2026-11-27T08:00:00Z'));
		expect(evening).toBe(morning);
		expect(nextDay).toBe(morning + 1);
	});
});
