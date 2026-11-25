/**
 * segmented-switch.svelte.test.ts
 * Component tests for the segmented switch: it shows which option is chosen and reports clicks.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SegmentedSwitch from './segmented-switch.svelte';

const themeOptions = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' }
];

describe('SegmentedSwitch', () => {
	it('is a named group with one pressed button, the chosen value', async () => {
		await render(SegmentedSwitch, {
			groupLabel: 'Theme',
			options: themeOptions,
			value: 'dark',
			onchange: () => {}
		});

		await expect.element(page.getByRole('group', { name: 'Theme' })).toBeVisible();
		const darkButton = page.getByRole('button', { name: 'Dark' });
		const lightButton = page.getByRole('button', { name: 'Light' });
		await expect.element(darkButton).toHaveAttribute('aria-pressed', 'true');
		await expect.element(lightButton).toHaveAttribute('aria-pressed', 'false');
	});

	it('reports the clicked option', async () => {
		const handleChange = vi.fn();
		await render(SegmentedSwitch, {
			groupLabel: 'Theme',
			options: themeOptions,
			value: 'light',
			onchange: handleChange
		});

		await page.getByRole('button', { name: 'Dark' }).click();
		expect(handleChange).toHaveBeenCalledWith('dark');
	});
});
