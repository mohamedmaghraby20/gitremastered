/**
 * quick-review.ts
 * Picks the home screen's "Quick review" question: one quiz question from a lesson the student
 * already worked on, so old lessons come back now and then (spaced practice). The pick changes
 * once a day and stays the same all day, so the card does not jump around on every visit.
 */

import type { QuizQuestion } from '@gitremastered/course-engine/types/quiz';

/** A lesson the student worked on, with its quiz questions. */
export type ReviewSource = { lessonId: string; questions: QuizQuestion[] };

/** The picked question and the lesson it comes from. */
export type ReviewPick = { lessonId: string; question: QuizQuestion };

/** Milliseconds in one day, to turn a date into a day number. */
const millisecondsPerDay = 24 * 60 * 60 * 1000;

/**
 * Turns a date into a whole day number (days since 1 January 1970), the same all day long.
 * @param date - any moment of the day
 * @returns the day number
 */
export function findDayNumber(date: Date): number {
	return Math.floor(date.getTime() / millisecondsPerDay);
}

/**
 * Picks one question from all the questions of the given lessons.
 * @param sources - the lessons the student worked on, in a fixed order
 * @param dayNumber - today's day number, from findDayNumber
 * @returns the question and its lesson, or null when there is nothing to review yet
 */
export function pickReviewQuestion(sources: ReviewSource[], dayNumber: number): ReviewPick | null {
	const allPicks: ReviewPick[] = sources.flatMap((source) =>
		source.questions.map((question) => ({ lessonId: source.lessonId, question }))
	);
	if (allPicks.length === 0) {
		return null;
	}
	return allPicks[dayNumber % allPicks.length];
}
