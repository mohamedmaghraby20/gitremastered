/**
 * CommandIndexNav.svelte.test.ts
 * Component tests for the command index's list: grouped commands, the current one marked,
 * and the terms list when the address is the Terms page.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { listGlossaryTerms } from '$lib/content/course-content';
import { listCommandGroups } from '$lib/command-index/command-index-data';
import CommandIndexNav from './CommandIndexNav.svelte';

describe('CommandIndexNav', () => {
	it('lists commands in groups and marks the one on screen', async () => {
		await render(CommandIndexNav, {
			groups: listCommandGroups(),
			terms: listGlossaryTerms(),
			currentPath: '/commands/git-add'
		});

		await expect.element(page.getByText('Daily loop')).toBeVisible();
		await expect
			.element(page.getByRole('link', { name: 'git add' }))
			.toHaveAttribute('aria-current', 'page');
		await expect
			.element(page.getByRole('link', { name: 'git status' }))
			.not.toHaveAttribute('aria-current');
		await expect
			.element(page.getByRole('radio', { name: 'Commands' }))
			.toHaveAttribute('aria-checked', 'true');
	});

	it('lists the terms on the Terms page', async () => {
		await render(CommandIndexNav, {
			groups: listCommandGroups(),
			terms: listGlossaryTerms(),
			currentPath: '/commands/terms'
		});

		await expect
			.element(page.getByRole('link', { name: 'staging area' }))
			.toHaveAttribute('href', '/commands/terms#staging-area');
	});
});
