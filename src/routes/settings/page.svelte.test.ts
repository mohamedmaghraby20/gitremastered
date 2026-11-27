/**
 * page.svelte.test.ts (settings)
 * Component tests for Settings: the lesson text size and reduce motion apply to the whole app
 * at once and are saved; About shows the version and the licenses.
 */

import { page } from 'vitest/browser';
import { get } from 'svelte/store';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createMemoryStorage, loadProgress, progress } from '$lib/stores/progress';
import { applyLessonTextSize, applyReducedMotion } from '$lib/settings/display-settings';
import SettingsPage from './+page.svelte';

describe('settings page', () => {
	beforeEach(async () => {
		await loadProgress(createMemoryStorage());
	});

	afterEach(() => {
		applyLessonTextSize(null);
		applyReducedMotion(false);
	});

	it('changes the lesson text size at once and saves it', async () => {
		await render(SettingsPage);
		const slider = page.getByRole('slider', { name: 'Lesson text size' });

		const sliderElement = slider.element() as HTMLInputElement;
		sliderElement.value = '21';
		sliderElement.dispatchEvent(new Event('input', { bubbles: true }));

		expect(document.documentElement.style.getPropertyValue('--type-lesson-size')).toBe('21px');
		expect(get(progress).lessonTextSize).toBe(21);
		await expect.element(page.getByText('Currently 21 px.', { exact: false })).toBeVisible();
	});

	it('turns reduce motion on for the whole app and saves it', async () => {
		await render(SettingsPage);
		const checkbox = page.getByRole('checkbox', { name: 'Reduce motion' });

		await checkbox.click();

		expect(document.documentElement.dataset.motion).toBe('reduced');
		expect(get(progress).isMotionReduced).toBe(true);
	});

	it('shows the version and the licenses', async () => {
		await render(SettingsPage);

		await expect.element(page.getByText(/^v\d+\.\d+\.\d+$/)).toBeVisible();
		await expect.element(page.getByText(/CC BY-NC-SA 3\.0/)).toBeVisible();
		await expect.element(page.getByText(/code is MIT/)).toBeVisible();
	});
});
