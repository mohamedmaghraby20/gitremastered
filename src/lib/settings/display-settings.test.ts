/**
 * display-settings.test.ts
 * Tests for the lesson text size and reduce motion settings, on a stand-in <html> element.
 */

import { describe, expect, it } from 'vitest';
import {
	applyLessonTextSize,
	applyReducedMotion,
	defaultLessonTextSize,
	type SettingsTarget
} from './display-settings';

/**
 * Makes a stand-in for the <html> element that remembers what was set.
 * @returns the stand-in and its style values
 */
function createTarget(): { target: SettingsTarget; styleValues: Map<string, string> } {
	const styleValues = new Map<string, string>();
	const target: SettingsTarget = {
		style: {
			setProperty: (name: string, value: string | null) => {
				styleValues.set(name, value ?? '');
			},
			removeProperty: (name: string) => {
				styleValues.delete(name);
				return '';
			}
		},
		dataset: {}
	};
	return { target, styleValues };
}

describe('applyLessonTextSize', () => {
	it('starts from the design token (18 px)', () => {
		expect(defaultLessonTextSize).toBe(18);
	});

	it('sets the size and keeps the design line-height ratio (18/30)', () => {
		const { target, styleValues } = createTarget();
		applyLessonTextSize(21, target);
		expect(styleValues.get('--type-lesson-size')).toBe('21px');
		expect(styleValues.get('--type-lesson-line-height')).toBe('35px');
	});

	it('goes back to the design size with null', () => {
		const { target, styleValues } = createTarget();
		applyLessonTextSize(21, target);
		applyLessonTextSize(null, target);
		expect(styleValues.size).toBe(0);
	});
});

describe('applyReducedMotion', () => {
	it('marks and unmarks the page', () => {
		const { target } = createTarget();
		applyReducedMotion(true, target);
		expect(target.dataset.motion).toBe('reduced');
		applyReducedMotion(false, target);
		expect(target.dataset.motion).toBeUndefined();
	});
});
