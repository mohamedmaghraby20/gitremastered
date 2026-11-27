/**
 * page.svelte.test.ts (course map)
 * Component tests for the course map with the real path files: both orders, the done and
 * current marks with their screen-reader words, and the remembered switch.
 */

import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	createMemoryStorage,
	loadProgress,
	markLessonFinished,
	saveLessonOpened
} from '$lib/stores/progress';
import CourseMapPage from './+page.svelte';

describe('course map page', () => {
	beforeEach(async () => {
		await loadProgress(createMemoryStorage());
	});

	it('shows the Pro path modules with every lesson as a link', async () => {
		await render(CourseMapPage);

		await expect.element(page.getByRole('heading', { name: 'Your daily loop' })).toBeVisible();
		const pilotRow = page.getByRole('link', { name: /Status, stage, commit/ });
		await expect.element(pilotRow).toHaveAttribute('href', '/lessons/three-areas');
	});

	it('marks a done lesson and the current one, in words as well as marks', async () => {
		await markLessonFinished('three-areas');
		await saveLessonOpened('ignoring-files');
		await render(CourseMapPage);

		await expect
			.element(page.getByRole('link', { name: /Status, stage, commit.*done/ }))
			.toBeVisible();
		const currentRow = page.getByRole('link', { name: /Ignore files.*current lesson/ });
		await expect.element(currentRow).toHaveAttribute('aria-current', 'step');
	});

	it('switches to the Book path: Pro Git chapters and sections', async () => {
		await render(CourseMapPage);

		await page.getByRole('radio', { name: 'Book path' }).click();

		await expect.element(page.getByRole('heading', { name: 'Git Basics' })).toBeVisible();
		await expect
			.element(page.getByRole('heading', { name: /2\.2 Recording Changes to the Repository/ }))
			.toBeVisible();
	});
});
