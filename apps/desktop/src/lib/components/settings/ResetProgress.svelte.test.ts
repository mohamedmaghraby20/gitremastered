/**
 * ResetProgress.svelte.test.ts
 * Component test: progress is only forgotten after the student confirms.
 */

import { get } from 'svelte/store';
import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	createMemoryStorage,
	loadProgress,
	markLessonFinished,
	progress
} from '$lib/stores/progress';
import ResetProgress from './ResetProgress.svelte';

describe('ResetProgress', () => {
	beforeEach(async () => {
		await loadProgress(createMemoryStorage());
		await markLessonFinished('three-areas');
	});

	it('asks first, and keeps progress on Cancel', async () => {
		await render(ResetProgress);

		await page.getByRole('button', { name: 'Reset progress…' }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();

		expect(get(progress).finishedLessons).toEqual(['three-areas']);
	});

	it('forgets progress after confirming', async () => {
		await render(ResetProgress);

		await page.getByRole('button', { name: 'Reset progress…' }).click();
		await page.getByRole('button', { name: 'Yes, reset' }).click();

		await expect.element(page.getByText('Progress reset.')).toBeVisible();
		expect(get(progress).finishedLessons).toEqual([]);
	});
});
