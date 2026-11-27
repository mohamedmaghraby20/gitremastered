/**
 * Sidebar.svelte.test.ts
 * Component tests for the sidebar: it marks the current page, and the icon rail
 * still gives every link a name that screen readers can read.
 */

import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { countCourseLessons } from '$lib/course-map/course-map-data';
import {
	createMemoryStorage,
	loadProgress,
	markLessonFinished,
	saveLessonOpened
} from '$lib/stores/progress';
import Sidebar from './Sidebar.svelte';

describe('Sidebar (full)', () => {
	beforeEach(async () => {
		await loadProgress(createMemoryStorage());
	});

	it('shows every main link with its text', async () => {
		await render(Sidebar, { currentPath: '/', variant: 'full' });

		for (const label of ['Home', 'Course map', 'Command index', 'Settings']) {
			await expect.element(page.getByRole('link', { name: label })).toBeVisible();
		}
	});

	it('marks only the current page with aria-current', async () => {
		await render(Sidebar, { currentPath: '/settings', variant: 'full' });

		const settingsLink = page.getByRole('link', { name: 'Settings' });
		const homeLink = page.getByRole('link', { name: 'Home' });
		await expect.element(settingsLink).toHaveAttribute('aria-current', 'page');
		await expect.element(homeLink).not.toHaveAttribute('aria-current');
	});

	it('shows path progress and the lessons of the current module, with done marks', async () => {
		await markLessonFinished('three-areas');
		await saveLessonOpened('ignoring-files');
		await render(Sidebar, { currentPath: '/lessons/ignoring-files', variant: 'full' });

		const pathBar = page.getByRole('progressbar', { name: 'Pro path' });
		await expect
			.element(pathBar)
			.toHaveAttribute('aria-valuetext', `1 of ${countCourseLessons()} done`);
		await expect.element(page.getByText('01 · Your daily loop')).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: /Status, stage, commit.*done/ }))
			.toBeVisible();
		const openLesson = page.getByRole('link', { name: /Ignore files/ });
		await expect.element(openLesson).toHaveAttribute('aria-current', 'page');
	});
});

describe('Sidebar (icon rail)', () => {
	it('gives every icon-only link a label for screen readers', async () => {
		await render(Sidebar, { currentPath: '/lessons/three-areas', variant: 'rail' });

		for (const label of ['Home', 'Course map', 'Command index', 'Settings']) {
			const railLink = page.getByRole('link', { name: label });
			await expect.element(railLink).toBeInTheDocument();
			await expect.element(railLink).toHaveAttribute('aria-label', label);
		}
	});

	it('marks the current page in the rail too', async () => {
		await render(Sidebar, { currentPath: '/course-map', variant: 'rail' });

		const courseMapLink = page.getByRole('link', { name: 'Course map' });
		await expect.element(courseMapLink).toHaveAttribute('aria-current', 'page');
	});
});
