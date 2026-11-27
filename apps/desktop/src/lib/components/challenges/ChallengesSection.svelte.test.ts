/**
 * ChallengesSection.svelte.test.ts
 * Component tests for the lesson's challenges, with the pilot's real challenges: the list with
 * levels and done marks, starting another challenge, and the active challenge's goals.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { getLesson } from '$lib/content/course-content';
import ChallengesSection from './ChallengesSection.svelte';

const pilotChallenges = getLesson('three-areas')?.challenges ?? [];

/**
 * Shows the pilot's challenges with the given state.
 * @param activeChallengeId - the challenge the practice project is set up for
 * @param finishedChallengeIds - the challenges already done
 * @returns the start handler, to check what it was called with
 */
async function renderPilotChallenges(
	activeChallengeId: string,
	finishedChallengeIds: string[]
): Promise<ReturnType<typeof vi.fn>> {
	const onstart = vi.fn();
	await render(ChallengesSection, {
		challenges: pilotChallenges,
		activeChallengeId,
		finishedChallengeIds,
		snapshot: null,
		onstart,
		onreset: () => Promise.resolve(),
		oncomplete: vi.fn()
	});
	return onstart;
}

describe('ChallengesSection', () => {
	it('lists three challenges, easy to hard, with done marks in words', async () => {
		await renderPilotChallenges('release-notes', ['release-notes']);

		await expect.element(page.getByRole('heading', { name: 'Challenges' })).toBeVisible();
		const titles = page
			.getByRole('heading', { level: 3 })
			.elements()
			.map((title) => title.textContent);
		expect(titles).toEqual(pilotChallenges.map((challenge) => challenge.title));
		expect(titles).toHaveLength(3);
		await expect.element(page.getByText('✓ Done')).toBeVisible();
		await expect.element(page.getByText(/Working on it/)).toBeVisible();
	});

	it('starts another challenge from its button', async () => {
		const onstart = await renderPilotChallenges('release-notes', []);

		await page.getByRole('button', { name: 'Start this challenge' }).first().click();

		expect(onstart).toHaveBeenCalledWith('two-commits');
	});

	it('shows the active challenge goals under the list, with its number and level', async () => {
		await renderPilotChallenges('unstage-secret', []);

		const activePanel = page.getByRole('region', { name: 'Active challenge' });
		await expect.element(activePanel).toBeVisible();
		await expect.element(page.getByText('Challenge 3 · Hard')).toBeVisible();
		await expect.element(page.getByText(/secrets.env is out of the staging area/)).toBeVisible();
	});
});
