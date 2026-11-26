/**
 * return-point.svelte.ts
 * Remembers where the student was when they followed a link from one lesson to another, so the
 * new lesson can show "← Back to <lesson>" and the way back lands on the same layer and the
 * same scroll position. It lives in memory only: a return point is for this session.
 */

import type { LessonLayerId } from '$lib/types/lesson';

/** Where the student was, and where the link took them. */
export type ReturnPoint = {
	fromLessonId: string;
	fromTitle: string;
	layerId: LessonLayerId;
	scrollTop: number; // pixels the lesson column was scrolled
	toLessonId: string;
};

/** A place to restore when a lesson opens: its layer and scroll position. */
export type PlaceToRestore = { lessonId: string; layerId: LessonLayerId; scrollTop: number };

/** The places, in Svelte state so the back bar appears and disappears by itself. */
const places: { returnPoint: ReturnPoint | null; placeToRestore: PlaceToRestore | null } = $state({
	returnPoint: null,
	placeToRestore: null
});

/**
 * Remembers where a course link was followed from.
 * @param returnPoint - the lesson, layer and scroll position, and the lesson the link opens
 */
export function rememberReturnPoint(returnPoint: ReturnPoint): void {
	places.returnPoint = returnPoint;
}

/**
 * Finds the way back for the lesson on screen.
 * @param lessonId - the lesson on screen
 * @returns the return point when this lesson was opened by a link, otherwise null
 */
export function findReturnPoint(lessonId: string): ReturnPoint | null {
	return places.returnPoint?.toLessonId === lessonId ? places.returnPoint : null;
}

/**
 * Starts going back: forgets the return point and asks the earlier lesson to restore its place.
 * @returns the lesson to open, or null when there is no way back
 */
export function startGoingBack(): string | null {
	const returnPoint = places.returnPoint;
	if (returnPoint === null) {
		return null;
	}
	places.placeToRestore = {
		lessonId: returnPoint.fromLessonId,
		layerId: returnPoint.layerId,
		scrollTop: returnPoint.scrollTop
	};
	places.returnPoint = null;
	return returnPoint.fromLessonId;
}

/** Forgets the way back (the student closed the back bar). */
export function forgetReturnPoint(): void {
	places.returnPoint = null;
}

/**
 * Takes the place a lesson should restore, once: the next opening starts at the top again.
 * @param lessonId - the lesson that is opening
 * @returns its layer and scroll position, or null when there is nothing to restore
 */
export function takePlaceToRestore(lessonId: string): PlaceToRestore | null {
	const place = places.placeToRestore;
	if (place === null || place.lessonId !== lessonId) {
		return null;
	}
	places.placeToRestore = null;
	return place;
}
