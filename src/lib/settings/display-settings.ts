/**
 * display-settings.ts
 * Applies the two reading settings from Settings to the whole app, the same way the theme works:
 * by setting something on the <html> element that the design tokens already read.
 * - Lesson text size: overrides the "lesson" text style's size and line height.
 * - Reduce motion: sets data-motion="reduced", which turns every duration token to 0 (app.css),
 *   on top of the computer's own "reduce motion" setting, which always counts too.
 */

import designTokensJson from '../../../docs/design/tokens.json';
import type { DesignTokens } from '$lib/types/design-tokens';

/** The parts of the <html> element these helpers use (tests pass a stand-in). */
export type SettingsTarget = {
	style: Pick<CSSStyleDeclaration, 'setProperty' | 'removeProperty'>;
	dataset: DOMStringMap;
};

/** The slider's range in Settings, in pixels (from the approved prototype). */
export const lessonTextSizeRange = { smallest: 16, largest: 22 };

/** The lesson text style from tokens.json: the size and line height the app starts with. */
const lessonStyle = (designTokensJson as DesignTokens).type.groups
	.flatMap((group) => group.styles)
	.find((style) => style.name === 'lesson');

/** The design's lesson text size in pixels (18 in tokens.json). */
export const defaultLessonTextSize = parseFloat(lessonStyle?.fontSize ?? '18px');

/** The design's line height divided by its size, kept when the size changes. */
const lessonLineHeightRatio = parseFloat(lessonStyle?.lineHeight ?? '30px') / defaultLessonTextSize;

/**
 * Sets the lesson text size, or goes back to the design's size.
 * @param textSize - the size in pixels, or null for the design's size
 * @param root - the element to change; the <html> element in the app
 */
export function applyLessonTextSize(
	textSize: number | null,
	root: SettingsTarget = document.documentElement
): void {
	if (textSize === null) {
		root.style.removeProperty('--type-lesson-size');
		root.style.removeProperty('--type-lesson-line-height');
		return;
	}
	root.style.setProperty('--type-lesson-size', `${textSize}px`);
	root.style.setProperty(
		'--type-lesson-line-height',
		`${Math.round(textSize * lessonLineHeightRatio)}px`
	);
}

/**
 * Turns the app's own "reduce motion" on or off.
 * @param isReduced - true to remove animations
 * @param root - the element to mark; the <html> element in the app
 */
export function applyReducedMotion(
	isReduced: boolean,
	root: SettingsTarget = document.documentElement
): void {
	if (isReduced) {
		root.dataset.motion = 'reduced';
	} else {
		delete root.dataset.motion;
	}
}

/**
 * Tells whether motion should be reduced right now: by the app's setting or the computer's.
 * For code that animates without CSS, like the terminal's blinking cursor.
 * @returns true when either asks for less motion
 */
export function isMotionReduced(): boolean {
	const isReducedInApp = document.documentElement.dataset.motion === 'reduced';
	const isReducedBySystem = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	return isReducedInApp || isReducedBySystem;
}
