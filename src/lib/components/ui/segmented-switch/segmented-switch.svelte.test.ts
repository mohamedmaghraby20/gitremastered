/**
 * segmented-switch.svelte.test.ts
 * Component tests for the segmented switch: a radio group that shows which option is chosen,
 * reports clicks, moves with the arrow keys, and is one Tab stop.
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SegmentedSwitch from './segmented-switch.svelte';

const themeOptions = [
	{ value: 'light', label: 'Light' },
	{ value: 'dark', label: 'Dark' },
	{ value: 'system', label: 'System' }
];

/**
 * Shows a theme switch with the given option chosen.
 * @param value - the chosen option's value
 * @returns the change handler, to check what it was called with
 */
async function renderThemeSwitch(value: string): Promise<ReturnType<typeof vi.fn>> {
	const handleChange = vi.fn();
	await render(SegmentedSwitch, {
		groupLabel: 'Theme',
		options: themeOptions,
		value,
		onchange: handleChange
	});
	return handleChange;
}

describe('SegmentedSwitch', () => {
	it('is a named radio group with one checked option, the chosen value', async () => {
		await renderThemeSwitch('dark');

		await expect.element(page.getByRole('radiogroup', { name: 'Theme' })).toBeVisible();
		await expect
			.element(page.getByRole('radio', { name: 'Dark' }))
			.toHaveAttribute('aria-checked', 'true');
		await expect
			.element(page.getByRole('radio', { name: 'Light' }))
			.toHaveAttribute('aria-checked', 'false');
	});

	it('reports the clicked option', async () => {
		const handleChange = await renderThemeSwitch('light');

		await page.getByRole('radio', { name: 'Dark' }).click();

		expect(handleChange).toHaveBeenCalledWith('dark');
	});

	it('chooses the next option with the arrow keys, wrapping at the end', async () => {
		const handleChange = await renderThemeSwitch('system');
		(page.getByRole('radio', { name: 'System' }).element() as HTMLElement).focus();

		await userEvent.keyboard('{ArrowRight}');

		expect(handleChange).toHaveBeenCalledWith('light');
		expect(document.activeElement?.textContent?.trim()).toBe('Light');
	});

	it('is a single Tab stop: only the chosen option can take Tab focus', async () => {
		await renderThemeSwitch('dark');

		await expect
			.element(page.getByRole('radio', { name: 'Dark' }))
			.toHaveAttribute('tabindex', '0');
		await expect
			.element(page.getByRole('radio', { name: 'Light' }))
			.toHaveAttribute('tabindex', '-1');
		await expect
			.element(page.getByRole('radio', { name: 'System' }))
			.toHaveAttribute('tabindex', '-1');
	});
});
