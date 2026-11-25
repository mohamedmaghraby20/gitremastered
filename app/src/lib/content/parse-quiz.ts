/**
 * parse-quiz.ts
 * Reads quiz.yaml: 2 to 4 questions, each with 2 to 4 answers and exactly one correct answer.
 */

import type { Quiz, QuizAnswer, QuizQuestion } from '../types/quiz.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads a whole quiz.yaml.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the typed quiz
 * @throws ContentError naming the file and the problem
 */
export function parseQuizText(fileText: string, fileName: string): Quiz {
	const reader = FieldReader.fromYaml(fileText, fileName);
	const questionReaders = reader.recordList('questions', 'question', { minimum: 2, maximum: 4 });
	return { questions: questionReaders.map(readQuestion) };
}

/**
 * Reads one question and checks it has exactly one correct answer.
 * @param questionReader - a reader for one item of "questions"
 * @returns the typed question
 */
function readQuestion(questionReader: FieldReader): QuizQuestion {
	const question = questionReader.text('question');
	const answerReaders = questionReader.recordList('answers', 'answer', { minimum: 2, maximum: 4 });
	const answers = answerReaders.map(readAnswer);
	const correctCount = answers.filter((answer) => answer.isCorrect).length;
	if (correctCount !== 1) {
		questionReader.fail(`needs exactly one correct answer, found ${correctCount}`);
	}
	return { question, answers };
}

/**
 * Reads one answer.
 * @param answerReader - a reader for one item of "answers"
 * @returns the typed answer
 */
function readAnswer(answerReader: FieldReader): QuizAnswer {
	return {
		text: answerReader.text('text'),
		isCorrect: answerReader.optionalFlag('correct'),
		explanation: answerReader.text('explanation')
	};
}
