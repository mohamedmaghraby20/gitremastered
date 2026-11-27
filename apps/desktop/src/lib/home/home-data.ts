/**
 * home-data.ts
 * Gathers everything the home screen shows from saved progress and the course content:
 * the lesson to continue (or the first lesson for a new student), up next, path progress and
 * the quick review question. The page only draws what this returns.
 */

import {
	getBookPath,
	getLesson,
	getLessonCard,
	getProPath,
	type LessonCard
} from '$lib/content/course-content';
import {
	countPathProgress,
	findContinueLessonId,
	findUpNextLessonIds,
	listBookPathLessonIds,
	listCoreLessonIds,
	listPathLessonIds,
	type PathProgress
} from '$lib/progress/learning-summary';
import { pickReviewQuestion, type ReviewPick, type ReviewSource } from '$lib/progress/quick-review';
import type { ProgressData } from '$lib/stores/progress';
import type { LessonLayerId } from '@gitremastered/course-engine/types/lesson';

/** How many lessons "Up next" lists. */
const upNextCount = 3;

/** Everything on the home screen. */
export type HomeData = {
	continueCard: LessonCard | null; // null for a student who has not opened a lesson yet
	furthestLayerId: LessonLayerId | undefined; // for the continue card's layer marks
	firstLessonCard: LessonCard | null; // where "Start the course" leads
	upNextCards: LessonCard[];
	coreProgress: PathProgress;
	wholeProgress: PathProgress;
	reviewPick: (ReviewPick & { lessonTitle: string }) | null;
};

/**
 * Builds the home screen's data.
 * @param progress - the saved progress
 * @param dayNumber - today's day number, which picks the quick review question
 * @returns what each card shows
 */
export function buildHomeData(progress: ProgressData, dayNumber: number): HomeData {
	const pathLessonIds = listChosenPathLessonIds(progress);
	const continueLessonId = findContinueLessonId(progress, pathLessonIds);
	const proPath = getProPath();
	const proLessonIds = proPath === undefined ? [] : listPathLessonIds(proPath);
	const coreLessonIds = proPath === undefined ? [] : listCoreLessonIds(proPath);
	// The lesson the main button opens never shows again in "Up next".
	const mainLessonId = continueLessonId ?? pathLessonIds[0];
	const upNextLessonIds = findUpNextLessonIds(progress, pathLessonIds, upNextCount + 1)
		.filter((lessonId) => lessonId !== mainLessonId)
		.slice(0, upNextCount);
	return {
		continueCard: continueLessonId === null ? null : (getLessonCard(continueLessonId) ?? null),
		furthestLayerId:
			continueLessonId === null ? undefined : progress.furthestLayers[continueLessonId],
		firstLessonCard: pathLessonIds.length === 0 ? null : (getLessonCard(pathLessonIds[0]) ?? null),
		upNextCards: toCards(upNextLessonIds),
		coreProgress: countPathProgress(progress, coreLessonIds),
		wholeProgress: countPathProgress(progress, proLessonIds),
		reviewPick: pickTodaysReview(progress, proLessonIds, dayNumber)
	};
}

/**
 * Lists the lessons of the path the student chose, in that path's order.
 * @param progress - the saved progress (its chosen path)
 * @returns the lesson IDs
 */
function listChosenPathLessonIds(progress: ProgressData): string[] {
	const bookPath = getBookPath();
	if (progress.chosenPathId === 'book-path' && bookPath !== null) {
		return listBookPathLessonIds(bookPath);
	}
	const proPath = getProPath();
	return proPath === undefined ? [] : listPathLessonIds(proPath);
}

/**
 * Picks today's review question from lessons the student finished or took the quiz of.
 * @param progress - the saved progress
 * @param lessonIds - every lesson, in a fixed order
 * @param dayNumber - today's day number
 * @returns the question with its lesson's title, or null when nothing was finished yet
 */
function pickTodaysReview(
	progress: ProgressData,
	lessonIds: string[],
	dayNumber: number
): HomeData['reviewPick'] {
	const sources: ReviewSource[] = [];
	for (const lessonId of lessonIds) {
		const isWorkedOn =
			progress.finishedLessons.includes(lessonId) || lessonId in progress.quizResults;
		const lesson = getLesson(lessonId);
		if (isWorkedOn && lesson !== undefined) {
			sources.push({ lessonId, questions: lesson.quiz.questions });
		}
	}
	const pick = pickReviewQuestion(sources, dayNumber);
	if (pick === null) {
		return null;
	}
	return { ...pick, lessonTitle: getLesson(pick.lessonId)?.title ?? pick.lessonId };
}

/**
 * Turns lesson IDs into list cards, skipping any unknown ID.
 * @param lessonIds - the lessons
 * @returns their cards
 */
function toCards(lessonIds: string[]): LessonCard[] {
	return lessonIds.map((lessonId) => getLessonCard(lessonId)).filter((card) => card !== undefined);
}
