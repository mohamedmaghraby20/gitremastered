/**
 * LessonBlocks.svelte.test.ts
 * Component tests: each ":::name" marker in lesson Markdown shows up as its own block component.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import LessonBlocks from './LessonBlocks.svelte';

const everyBlock = [
	'Plain paragraph.',
	':::definitions',
	'- term: Staging area',
	'  area: staging',
	'  text: The next commit.',
	':::',
	':::try-it',
	'1. Run `git status`.',
	':::',
	':::careful',
	'Stage again after editing.',
	':::',
	':::sidenote',
	'A line from the book.',
	':::',
	':::compare',
	'today: "`git restore --staged`"',
	'book: "`git reset HEAD`"',
	':::'
].join('\n');

describe('LessonBlocks', () => {
	it('shows plain Markdown as text', async () => {
		await render(LessonBlocks, { markdown: everyBlock });
		await expect.element(page.getByText('Plain paragraph.')).toBeVisible();
	});

	it('shows a definition row with its area swatch', async () => {
		await render(LessonBlocks, { markdown: everyBlock });
		await expect.element(page.getByRole('term')).toHaveTextContent('Staging area');
		await expect.element(page.getByRole('definition')).toHaveTextContent('The next commit.');
		const swatch = page.getByTestId('area-swatch');
		await expect.element(swatch).toHaveAttribute('data-area', 'staging');
	});

	it('shows "Try it" steps as a numbered list', async () => {
		await render(LessonBlocks, { markdown: everyBlock });
		const tryIt = page.getByRole('region', { name: 'Try it' });
		await expect.element(tryIt.getByRole('list')).toBeVisible();
	});

	it('labels the careful note and the sidenote', async () => {
		await render(LessonBlocks, { markdown: everyBlock });
		const carefulNote = page.getByRole('note', { name: 'Careful' });
		const sidenote = page.getByRole('note', { name: 'From Pro Git' });
		await expect.element(carefulNote.getByText('Stage again after editing.')).toBeVisible();
		await expect.element(sidenote.getByText('A line from the book.')).toBeVisible();
	});

	it('shows the "Use today / In the book" comparison side by side', async () => {
		await render(LessonBlocks, { markdown: everyBlock });
		const comparison = page.getByRole('region', { name: 'Use today and in the book' });
		await expect.element(comparison.getByText('Use today')).toBeVisible();
		await expect.element(comparison.getByText('git restore --staged')).toBeVisible();
		await expect.element(comparison.getByText('In the book')).toBeVisible();
		await expect.element(comparison.getByText('git reset HEAD')).toBeVisible();
	});
});
