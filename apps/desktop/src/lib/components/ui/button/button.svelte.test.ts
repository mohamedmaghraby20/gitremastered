/**
 * button.svelte.test.ts
 * Component tests for the keycap Button: real <button>, right variant, shortcut key, clicks.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ButtonTestHost from './button-test-host.svelte';

describe('Button', () => {
	it('is a real <button> with its label as its accessible name', async () => {
		await render(ButtonTestHost, { label: 'Check mission' });

		const button = page.getByRole('button', { name: 'Check mission' });
		await expect.element(button).toBeInTheDocument();
		expect(button.element().tagName).toBe('BUTTON');
	});

	it('does not submit forms by accident: type is "button" unless asked', async () => {
		await render(ButtonTestHost, { label: 'Reset practice' });

		await expect.element(page.getByRole('button')).toHaveAttribute('type', 'button');
	});

	it('uses the primary variant by default', async () => {
		await render(ButtonTestHost, { label: 'Next lesson' });

		await expect.element(page.getByRole('button')).toHaveAttribute('data-variant', 'primary');
	});

	it('renders the secondary and ghost variants with their own look', async () => {
		await render(ButtonTestHost, { label: 'Reset practice', variant: 'secondary' });
		await render(ButtonTestHost, { label: 'Show a hint', variant: 'ghost' });

		const secondaryButton = page.getByRole('button', { name: 'Reset practice' });
		const ghostButton = page.getByRole('button', { name: 'Show a hint' });
		await expect.element(secondaryButton).toHaveAttribute('data-variant', 'secondary');
		await expect.element(ghostButton).toHaveAttribute('data-variant', 'ghost');
		expect(secondaryButton.element().className).not.toBe(ghostButton.element().className);
	});

	it('shows the keyboard shortcut in a <kbd> key', async () => {
		await render(ButtonTestHost, { label: 'Check mission', shortcut: 'Enter' });

		const shortcutKey = page.getByRole('button').element().querySelector('kbd');
		expect(shortcutKey?.textContent).toBe('Enter');
	});

	it('calls the click handler when clicked', async () => {
		const handleClick = vi.fn();
		await render(ButtonTestHost, { label: 'Check mission', onclick: handleClick });

		await page.getByRole('button').click();
		expect(handleClick).toHaveBeenCalledOnce();
	});
});
