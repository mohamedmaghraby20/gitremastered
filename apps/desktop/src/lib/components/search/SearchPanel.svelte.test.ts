/**
 * SearchPanel.svelte.test.ts
 * Component tests for the Ctrl K quick search panel, opened from the real top bar: focus goes
 * to the search box, results appear as you type, the arrows move the highlight, "See all
 * results" keeps the query, and Esc closes the panel and gives focus back.
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TopBar from '$lib/components/app-shell/TopBar.svelte';

describe('quick search panel', () => {
	it('opens with Ctrl K, searches as you type, and closes with Esc, giving focus back', async () => {
		await render(TopBar, { currentPath: '/' });
		const settingsLink = page.getByRole('link', { name: 'Settings' });
		(settingsLink.element() as HTMLElement).focus();

		await userEvent.keyboard('{Control>}k{/Control}');
		const searchBox = page.getByRole('combobox', { name: /Search lessons/ });
		await expect.element(searchBox).toHaveFocus();

		await userEvent.keyboard('staging');
		await expect.element(page.getByRole('option', { name: /^staging area/ }).first()).toBeVisible();
		const allResults = page.getByRole('link', { name: /See all results/ });
		await expect.element(allResults).toHaveAttribute('href', '/search?q=staging');

		await userEvent.keyboard('{Escape}');
		await expect.element(searchBox).not.toBeInTheDocument();
		await expect.element(settingsLink).toHaveFocus();
	});

	it('moves the highlight with the arrow keys, for screen readers too', async () => {
		await render(TopBar, { currentPath: '/' });
		await page.getByRole('button', { name: /Search lessons/ }).click();

		await userEvent.keyboard('git');
		await userEvent.keyboard('{ArrowDown}');

		const searchBox = page.getByRole('combobox', { name: /Search lessons/ });
		const firstOption = page.getByRole('option').first();
		await expect.element(firstOption).toHaveAttribute('aria-selected', 'true');
		const highlightedId = firstOption.element().id;
		await expect.element(searchBox).toHaveAttribute('aria-activedescendant', highlightedId);
	});
});
