/**
 * quiz.ts
 * The shape of a lesson's quiz, read from quiz.yaml (SPEC.md section 4).
 */

/** One answer to pick, with the reason it is right or wrong. */
export type QuizAnswer = {
	text: string;
	isCorrect: boolean;
	explanation: string; // shown after checking, whether the student picked it or not
};

/** One scenario question with 2 to 4 answers, exactly one of them correct. */
export type QuizQuestion = {
	question: string;
	answers: QuizAnswer[];
};

/** A lesson's quiz: 2 to 4 questions. */
export type Quiz = {
	questions: QuizQuestion[];
};
