/**
 * ColorSwatches.svelte.test.ts
 * Component test: the swatch grid shows one labelled swatch per color token.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ColorSwatches from './ColorSwatches.svelte';

const sampleTokens = [
	{ name: 'canvas', value: { light: '#fafafa', dark: '#121212' }, usage: 'App background.' },
	{ name: 'ink', value: { light: '#303055', dark: '#f2f2f2' }, usage: 'Text.' }
];

describe('ColorSwatches', () => {
	it('shows one list item per color token, named after the token', async () => {
		await render(ColorSwatches, { colorTokens: sampleTokens });

		await expect.element(page.getByRole('listitem').nth(1)).toBeInTheDocument();
		await expect.element(page.getByText('canvas', { exact: true })).toBeVisible();
		await expect.element(page.getByText('ink', { exact: true })).toBeVisible();
	});

	it('paints each swatch with the token variable, not a hard-coded color', async () => {
		const { container } = await render(ColorSwatches, { colorTokens: sampleTokens });

		const firstSwatch = container.querySelector<HTMLElement>('[data-swatch="canvas"]');
		expect(firstSwatch?.style.background).toBe('var(--canvas)');
	});
});
