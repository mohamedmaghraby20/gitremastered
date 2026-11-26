/**
 * CourseLinks.svelte.test.ts
 * Component tests for links between lessons, with the real content: the hover card on hover and
 * on keyboard focus (read by screen readers, hidden with Esc), and the lesson reader coming
 * back on the same layer after "← Back to".
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { getLesson } from '$lib/content/course-content';
import { rememberReturnPoint, startGoingBack } from '$lib/navigation/return-point.svelte';
import LessonMarkdown from './LessonMarkdown.svelte';
import LessonReader from './LessonReader.svelte';

/**
 * Reads the hover card's text.
 * @returns the text, or "" when no card is shown
 */
function readCardText(): string {
	return document.querySelector('[role=tooltip]')?.textContent ?? '';
}

describe('course links', () => {
	it('show a card on hover with the lesson and what a click does', async () => {
		await render(LessonMarkdown, { markdown: 'Next: [ignore files](lesson:ignoring-files).' });
		const link = page.getByRole('link', { name: 'ignore files' });

		await link.hover();

		await expect.poll(readCardText).toContain('Ignore files with .gitignore');
		expect(readCardText()).toContain('Click to open this lesson.');
		const cardId = document.querySelector('[role=tooltip]')?.id ?? '';
		await expect.element(link).toHaveAttribute('aria-describedby', cardId);
	});

	it('show the card on keyboard focus and hide it with Esc', async () => {
		await render(LessonMarkdown, { markdown: 'On [branch](term:branch) main.' });

		(page.getByRole('link', { name: 'branch' }).element() as HTMLElement).focus();
		await expect.poll(readCardText).toContain('Coming later');

		await userEvent.keyboard('{Escape}');
		await expect.poll(readCardText).toBe('');
	});

	it('bring the student back to the same layer after "Back to"', async () => {
		const pilot = getLesson('three-areas');
		if (pilot === undefined) {
			throw new Error('the pilot lesson is missing');
		}
		rememberReturnPoint({
			fromLessonId: 'three-areas',
			fromTitle: pilot.title,
			layerId: 'underTheHood',
			scrollTop: 0,
			toLessonId: 'ignoring-files'
		});
		startGoingBack();

		await render(LessonReader, { lesson: pilot, place: null });

		await expect
			.element(page.getByRole('tab', { name: /Under the hood/ }))
			.toHaveAttribute('aria-selected', 'true');
	});
});
