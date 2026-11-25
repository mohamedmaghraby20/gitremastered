/**
 * score-quiz.test.ts
 * Tests for answer letters, keyboard picks, judging answers and scoring the quiz.
 */

import { describe, expect, it } from 'vitest';
import type { Quiz } from '$lib/types/quiz';
import { answerIndexForKey, answerLetter, judgeAnswer, scoreQuiz } from './score-quiz';

const quiz: Quiz = {
	questions: [
		{
			question: 'Q1',
			answers: [
				{ text: 'Right', isCorrect: true, explanation: 'Yes.' },
				{ text: 'Wrong', isCorrect: false, explanation: 'No.' }
			]
		},
		{
			question: 'Q2',
			answers: [
				{ text: 'Wrong', isCorrect: false, explanation: 'No.' },
				{ text: 'Wrong', isCorrect: false, explanation: 'No.' },
				{ text: 'Right', isCorrect: true, explanation: 'Yes.' }
			]
		}
	]
};

describe('answer letters and keys', () => {
	it('letters answers A to D', () => {
		expect([0, 1, 2, 3].map(answerLetter)).toEqual(['A', 'B', 'C', 'D']);
	});

	it('turns A–D keys into answer positions, only for answers that exist', () => {
		expect(answerIndexForKey('b', 3)).toBe(1);
		expect(answerIndexForKey('C', 3)).toBe(2);
		expect(answerIndexForKey('d', 3)).toBeNull();
		expect(answerIndexForKey('x', 3)).toBeNull();
	});
});

describe('judgeAnswer', () => {
	it('tells right, wrong and unanswered apart', () => {
		expect(judgeAnswer(quiz.questions[0], 0)).toBe('correct');
		expect(judgeAnswer(quiz.questions[0], 1)).toBe('wrong');
		expect(judgeAnswer(quiz.questions[0], null)).toBe('unanswered');
	});
});

describe('scoreQuiz', () => {
	it('counts the right answers', () => {
		expect(scoreQuiz(quiz, [0, 0])).toEqual({
			correctCount: 1,
			questionCount: 2,
			outcomes: ['correct', 'wrong']
		});
	});

	it('counts missing picks as unanswered', () => {
		expect(scoreQuiz(quiz, [null]).outcomes).toEqual(['unanswered', 'unanswered']);
	});
});
