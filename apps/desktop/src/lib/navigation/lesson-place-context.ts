/**
 * lesson-place-context.ts
 * Lets a link deep inside a lesson's text ask the lesson where the student is right now
 * (lesson, layer, scroll position), so following the link can remember the way back.
 * The lesson reader provides it with Svelte context; text outside a lesson has none.
 */

import { getContext, setContext } from 'svelte';
import type { LessonLayerId } from '@gitremastered/course-engine/types/lesson';

/** Where the student is in the lesson on screen. */
export type ReadingPlace = {
	lessonId: string;
	title: string;
	layerId: LessonLayerId;
	scrollTop: number;
};

/** The context key: a symbol, so no other context can clash with it. */
const lessonPlaceKey = Symbol('lesson place');

/**
 * Offers "where am I?" to everything inside the lesson reader.
 * @param describePlace - reads the student's place when asked
 */
export function provideLessonPlace(describePlace: () => ReadingPlace): void {
	setContext(lessonPlaceKey, describePlace);
}

/**
 * Asks for the lesson reader's "where am I?", when there is one.
 * @returns the function that reads the place, or undefined outside a lesson
 */
export function findLessonPlaceReader(): (() => ReadingPlace) | undefined {
	return getContext<(() => ReadingPlace) | undefined>(lessonPlaceKey);
}
