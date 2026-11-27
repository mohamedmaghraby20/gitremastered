/**
 * panel-sizes.ts
 * The math behind the lesson screen's resize handles, as pure functions: turn a pointer
 * position into a share of the space, move a share with the arrow keys, and keep every share
 * between its limits so no panel can vanish.
 * A share is a percentage of the space the two panels split, like 45 for 45%.
 */

/** The smallest and largest share one panel may take. */
export type ShareLimits = { smallest: number; largest: number };

/** How far one arrow-key press moves a handle, in percent. */
export const keyboardStep = 2;

/** The lesson column's share of the lesson screen's width. */
export const lessonColumnLimits: ShareLimits = { smallest: 25, largest: 70 };

/** The terminal's share of the practice column's height. */
export const terminalLimits: ShareLimits = { smallest: 25, largest: 80 };

/**
 * Keeps a share between its limits.
 * @param share - any share, in percent
 * @param limits - the smallest and largest allowed
 * @returns the share, moved inside the limits if needed
 */
export function clampShare(share: number, limits: ShareLimits): number {
	return Math.min(limits.largest, Math.max(limits.smallest, share));
}

/**
 * Turns the pointer's position into the share of the first panel (left or top).
 * @param pointerPosition - the pointer's x (or y) in pixels
 * @param spaceStart - where the shared space starts, in pixels
 * @param spaceSize - the shared space's width (or height), in pixels
 * @param limits - the first panel's limits
 * @returns the first panel's share, rounded to one decimal, inside the limits
 */
export function shareFromPointer(
	pointerPosition: number,
	spaceStart: number,
	spaceSize: number,
	limits: ShareLimits
): number {
	if (spaceSize <= 0) {
		return limits.smallest;
	}
	const share = ((pointerPosition - spaceStart) / spaceSize) * 100;
	return clampShare(Math.round(share * 10) / 10, limits);
}

/**
 * Moves a share with the keyboard. Left / Up shrink the first panel, Right / Down grow it,
 * Home and End jump to the limits.
 * @param currentShare - the share now
 * @param key - the pressed key's name
 * @param limits - the first panel's limits
 * @returns the new share, or null when the key does not move the handle
 */
export function shareFromKey(
	currentShare: number,
	key: string,
	limits: ShareLimits
): number | null {
	if (key === 'ArrowLeft' || key === 'ArrowUp') {
		return clampShare(currentShare - keyboardStep, limits);
	}
	if (key === 'ArrowRight' || key === 'ArrowDown') {
		return clampShare(currentShare + keyboardStep, limits);
	}
	if (key === 'Home') {
		return limits.smallest;
	}
	if (key === 'End') {
		return limits.largest;
	}
	return null;
}
