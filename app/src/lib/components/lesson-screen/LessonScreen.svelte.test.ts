/**
 * LessonScreen.svelte.test.ts
 * Layout test for the lesson screen at the designed window size (1440 × 900):
 * a long lesson must scroll inside its own column, and the practice column (visualizer and
 * terminal) must stay inside the window instead of stretching to the lesson's full length.
 * Found in the pilot review: the terminal ended up ~3,800 px down the page, out of sight.
 */

import '../../../app.css';
import { page } from 'vitest/browser';
import { afterEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { sampleLesson } from '../../../../tests/fixtures/sample-lesson-object.ts';
import type { Lesson } from '$lib/types/lesson';
import LessonScreen from './LessonScreen.svelte';

/** A lesson whose "Use it" text is far taller than the window. */
const longLesson: Lesson = {
	...sampleLesson,
	sections: {
		...sampleLesson.sections,
		useIt: Array.from(
			{ length: 80 },
			(_, index) => `Paragraph ${index + 1} of a long lesson.`
		).join('\n\n')
	}
};

/**
 * Reads where an element sits on screen.
 * @param selector - CSS selector of the element
 * @returns its bounding box
 */
function boxOf(selector: string): DOMRect {
	const element = document.querySelector(selector);
	if (element === null) {
		throw new Error(`Nothing matches ${selector}`);
	}
	return element.getBoundingClientRect();
}

afterEach(async () => {
	await page.viewport(414, 896);
});

describe('LessonScreen layout', () => {
	it('keeps both columns inside a 1440 × 900 window with a long lesson', async () => {
		await page.viewport(1440, 900);
		// Stands in for the app's <main>: the window height minus the 48px top bar.
		const pageArea = document.createElement('div');
		pageArea.style.height = '852px';
		document.body.append(pageArea);
		await render(LessonScreen, { target: pageArea, props: { lesson: longLesson, place: null } });

		await expect.element(page.getByRole('region', { name: 'Practice' })).toBeVisible();
		const practiceBox = boxOf('section[aria-label="Practice"]');
		const lessonBox = boxOf('article');

		expect(practiceBox.bottom).toBeLessThanOrEqual(window.innerHeight);
		expect(lessonBox.bottom).toBeLessThanOrEqual(window.innerHeight);
		expect(practiceBox.left).toBeGreaterThan(lessonBox.left);
		// Nothing inside a column, not even screen-reader-only text, may stretch the page itself.
		expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight);
	});
});
