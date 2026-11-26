/**
 * parse-quiz.test.ts
 * Tests for reading quiz.yaml into a typed quiz.
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../../tests/fixtures/read-fixture.ts';
import { parseQuizText } from './parse-quiz.ts';

const fileName = 'content/lessons/sample-lesson/quiz.yaml';
const validQuizText = readSampleLessonFile('quiz.yaml');

describe('parseQuizText', () => {
	it('reads a valid quiz', () => {
		const quiz = parseQuizText(validQuizText, fileName);
		expect(quiz.questions).toHaveLength(2);
		expect(quiz.questions[0].answers[0]).toEqual({
			text: 'In the working tree',
			isCorrect: true,
			explanation: 'Edits stay in the working tree until you stage them.'
		});
		expect(quiz.questions[0].answers[1].isCorrect).toBe(false);
	});

	it('rejects a right-answer explanation that starts with "Right" (the screen adds it)', () => {
		const saysRightTwice = validQuizText.replace(
			'explanation: "Edits stay in the working tree until you stage them."',
			'explanation: "Right. Edits stay in the working tree."'
		);
		expect(() => parseQuizText(saysRightTwice, fileName)).toThrow(
			'should not start with "Right": the quiz already shows "✓ Right."'
		);
	});

	it('rejects a question with two correct answers', () => {
		const twoCorrect = validQuizText.replace(
			'      - text: "In the repository"\n',
			'      - text: "In the repository"\n        correct: true\n'
		);
		expect(() => parseQuizText(twoCorrect, fileName)).toThrow(
			`${fileName}: question 1: needs exactly one correct answer, found 2`
		);
	});

	it('rejects a quiz with only one question', () => {
		const oneQuestion = validQuizText.split('  - question: "What does git add do?"')[0];
		expect(() => parseQuizText(oneQuestion, fileName)).toThrow(
			'"questions" needs 2 to 4 items, found 1'
		);
	});
});
