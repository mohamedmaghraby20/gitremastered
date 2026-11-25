/**
 * score-quiz.ts
 * Pure quiz logic: answer letters, checking one answer, keyboard letter picks, and the score.
 */

import type { Quiz, QuizQuestion } from '$lib/types/quiz';

/** The letters printed on the answer keycaps, in order. */
const answerLetters = ['A', 'B', 'C', 'D'] as const;

/** How one question went. */
export type QuestionOutcome = 'correct' | 'wrong' | 'unanswered';

/** The result of a whole quiz. */
export type QuizScore = {
	correctCount: number;
	questionCount: number;
	outcomes: QuestionOutcome[]; // one per question, in order
};

/**
 * Gives the letter for an answer position.
 * @param answerIndex - 0 for the first answer
 * @returns "A", "B", "C" or "D"
 */
export function answerLetter(answerIndex: number): string {
	return answerLetters[answerIndex] ?? '?';
}

/**
 * Turns a pressed key into an answer position, for picking answers with A–D.
 * @param key - the key's name, e.g. "b" or "B"
 * @param answerCount - how many answers the question has
 * @returns the answer position, or null if the key is not one of this question's letters
 */
export function answerIndexForKey(key: string, answerCount: number): number | null {
	const answerIndex = answerLetters.findIndex((letter) => letter === key.toUpperCase());
	if (answerIndex === -1 || answerIndex >= answerCount) {
		return null;
	}
	return answerIndex;
}

/**
 * Checks one picked answer.
 * @param question - the question
 * @param pickedIndex - the picked answer's position, or null if none
 * @returns how the question went
 */
export function judgeAnswer(question: QuizQuestion, pickedIndex: number | null): QuestionOutcome {
	if (pickedIndex === null) {
		return 'unanswered';
	}
	return question.answers[pickedIndex]?.isCorrect === true ? 'correct' : 'wrong';
}

/**
 * Scores a whole quiz.
 * @param quiz - the quiz
 * @param pickedIndexes - the picked answer per question (null where nothing was picked)
 * @returns the number right, the number of questions, and each question's outcome
 */
export function scoreQuiz(quiz: Quiz, pickedIndexes: (number | null)[]): QuizScore {
	const outcomes = quiz.questions.map((question, questionIndex) =>
		judgeAnswer(question, pickedIndexes[questionIndex] ?? null)
	);
	return {
		correctCount: outcomes.filter((outcome) => outcome === 'correct').length,
		questionCount: quiz.questions.length,
		outcomes
	};
}
