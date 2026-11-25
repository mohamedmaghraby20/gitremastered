/**
 * LessonReader.svelte.test.ts
 * Component tests for the lesson column: header, layer tabs that switch the text, the recap
 * card and the Previous / Next links.
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import { render } from 'vitest-browser-svelte';
import { sampleLesson } from '../../../../tests/fixtures/sample-lesson-object.ts';
import LessonReader from './LessonReader.svelte';
import type { LessonPlace } from '$lib/content/lesson-navigation';

const samplePlace: LessonPlace = {
	lessonNumber: 5,
	moduleTitle: 'Your daily loop',
	previousLesson: { id: 'start-a-repo', title: 'Start a repo', lessonNumber: 4 },
	nextLesson: null
};

describe('LessonReader', () => {
	it('shows the title, the lesson number and the Pro Git citation', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('A sample lesson');
		await expect.element(page.getByText('05')).toBeVisible();
		const citation = page.getByRole('link', { name: 'Pro Git 2.2 Recording Changes' });
		await expect.element(citation).toHaveAttribute('href', sampleLesson.bookUrl);
	});

	it('starts on "Must know" with the lede', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await expect
			.element(page.getByRole('tab', { name: /Must know/ }))
			.toHaveAttribute('aria-selected', 'true');
		await expect.element(page.getByText('This sentence is the lede.')).toBeVisible();
		await expect.element(page.getByText(/Must know text with/)).toBeVisible();
	});

	it('switches layers when a tab is clicked', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await page.getByRole('tab', { name: /Under the hood/ }).click();
		await expect.element(page.getByText('Under the hood text.')).toBeVisible();
		await expect.element(page.getByText(/Must know text with/)).not.toBeInTheDocument();
	});

	it('moves between tabs with the arrow keys', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await page.getByRole('tab', { name: /Must know/ }).click();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('tab', { name: /Under the hood/ })).toHaveFocus();
		await expect.element(page.getByText('Under the hood text.')).toBeVisible();
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		await expect.element(page.getByText('Advanced text.')).toBeVisible();
	});

	it('shows the mission and quiz under "Must know" only, keeping them on other tabs', async () => {
		const afterText = createRawSnippet(() => ({ render: () => '<p>Mission and quiz here</p>' }));
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace, afterText });

		await expect.element(page.getByText('Mission and quiz here')).toBeVisible();
		await page.getByRole('tab', { name: /Under the hood/ }).click();
		await expect.element(page.getByText('Mission and quiz here')).not.toBeVisible();
		await expect.element(page.getByText('Mission and quiz here')).toBeInTheDocument();
	});

	it('always shows the recap card', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await page.getByRole('tab', { name: /Advanced/ }).click();
		await expect.element(page.getByText('Recap point.')).toBeVisible();
	});

	it('links to the previous lesson and has no next link on the last lesson', async () => {
		await render(LessonReader, { lesson: sampleLesson, place: samplePlace });

		await expect.element(page.getByRole('link', { name: /04 Start a repo/ })).toBeVisible();
		await expect.element(page.getByRole('link', { name: /→/ })).not.toBeInTheDocument();
	});
});
