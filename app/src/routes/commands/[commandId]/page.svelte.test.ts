/**
 * page.svelte.test.ts (one command)
 * Component tests for a command page with the real content: title, usage, blocks and
 * "Learn it" links, and the note for an unknown command.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { getCommandPage } from '$lib/content/course-content';
import { toLessonCards } from '$lib/command-index/command-index-data';
import CommandPage from './+page.svelte';

/**
 * Builds the page data the loader would give for a command ID.
 * @param commandId - e.g. "git-restore"
 * @returns the data
 */
function pageData(commandId: string) {
	const commandPage = getCommandPage(commandId) ?? null;
	const lessonCards = commandPage === null ? [] : toLessonCards(commandPage.lessonIds);
	return { commandId, commandPage, lessonCards };
}

describe('command page', () => {
	it('shows the command, its usage, its careful note and the lessons that teach it', async () => {
		await render(CommandPage, {
			data: pageData('git-restore'),
			params: { commandId: 'git-restore' }
		});

		await expect.element(page.getByRole('heading', { level: 1 })).toHaveTextContent('git restore');
		await expect.element(page.getByText('git restore --staged <file>').first()).toBeVisible();
		await expect.element(page.getByText(/deletes your uncommitted edits/)).toBeVisible();
		const lessonLink = page.getByRole('link', { name: /Status, stage, commit/ });
		await expect.element(lessonLink).toHaveAttribute('href', '/lessons/three-areas');
		await expect.element(page.getByRole('link', { name: /Pro Git 2\.4/ })).toBeVisible();
	});

	it('says so for an unknown command', async () => {
		await render(CommandPage, {
			data: pageData('git-nothing'),
			params: { commandId: 'git-nothing' }
		});

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Command not found');
	});
});
