/**
 * page.svelte.test.ts
 * Component tests for the home page with the real course content: a first-time student and a
 * returning one, from saved progress.
 */

import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	createMemoryStorage,
	loadProgress,
	markLessonFinished,
	saveLayerRead,
	saveLessonOpened
} from '$lib/stores/progress';
import HomePage from './+page.svelte';

describe('home page', () => {
	beforeEach(async () => {
		await loadProgress(createMemoryStorage());
	});

	it('invites a first-time student to start the first lesson', async () => {
		await render(HomePage);

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Start learning Git');
		const startLink = page.getByRole('link', { name: /Start the first lesson/ });
		await expect.element(startLink).toHaveAttribute('href', '/lessons/what-is-git');
		await expect.element(page.getByText(/Finish a lesson, and a question/)).toBeVisible();
	});

	it('lets a returning student continue the last lesson, with read layers marked', async () => {
		await saveLessonOpened('three-areas');
		await saveLayerRead('three-areas', 'mustKnow');
		await render(HomePage);

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Pick up where you left off');
		const continueLink = page.getByRole('link', { name: /Continue lesson/ });
		await expect.element(continueLink).toHaveAttribute('href', '/lessons/three-areas');
		await expect.element(page.getByText('Read:')).toBeInTheDocument();
		await expect.element(page.getByRole('link', { name: /Ignore files/ })).toBeVisible();
	});

	it('counts finished lessons on the path card and offers a review question', async () => {
		await markLessonFinished('three-areas');
		await render(HomePage);

		const wholeCourse = page.getByRole('progressbar', { name: 'Whole course' });
		await expect.element(wholeCourse).toHaveAttribute('aria-valuenow', '1');
		await expect.element(page.getByText(/from Status, stage, commit/)).toBeVisible();
	});

	it('switches the path with the Pro / Book switch', async () => {
		await render(HomePage);

		await page.getByRole('radio', { name: 'Book' }).click();

		await expect
			.element(page.getByRole('radio', { name: 'Book' }))
			.toHaveAttribute('aria-checked', 'true');
	});
});
