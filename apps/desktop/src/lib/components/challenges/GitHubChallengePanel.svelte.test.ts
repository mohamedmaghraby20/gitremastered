/**
 * GitHubChallengePanel.svelte.test.ts
 * Component tests for the GitHub part of the challenge panel: the consent card (accept, setup
 * steps when `gh` is not ready) and the status line ("Check GitHub now").
 */

import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { getGitHubConnection } from '$lib/tauri/commands';
import type { GitHubWatch } from '$lib/practice/github-watch.svelte';
import type { GitHubConnection } from '@gitremastered/course-engine/types/github';
import GitHubChallengePanel from './GitHubChallengePanel.svelte';

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true }));
vi.mock('$lib/tauri/commands', () => ({ getGitHubConnection: vi.fn() }));

const mockedGetConnection = vi.mocked(getGitHubConnection);
const repoName = 'gitremastered-practice-flow';

/**
 * Makes the fake GitHub CLI answer with the given connection.
 * @param changes - the fields that differ from a fully connected account
 */
function connectionIs(changes: Partial<GitHubConnection>): void {
	mockedGetConnection.mockResolvedValue({
		isGhInstalled: true,
		isSignedIn: true,
		login: 'octocat',
		canDeleteRepos: false,
		...changes
	});
}

/**
 * Builds a fake watch with the fields the status line reads.
 * @param fields - state to set
 * @returns the fake and its readNow spy
 */
function fakeWatch(fields: { isReading?: boolean; problem?: string | null }) {
	const readNow = vi.fn().mockResolvedValue(undefined);
	const watch = {
		context: { state: { repo: 'octocat/gitremastered-practice-flow' }, startedAt: 'now' },
		problem: fields.problem ?? null,
		isReading: fields.isReading ?? false,
		readNow
	} as unknown as GitHubWatch;
	return { watch, readNow };
}

describe('GitHubChallengePanel consent', () => {
	beforeEach(() => {
		mockedGetConnection.mockReset();
	});

	it('calls onConsent when the student accepts', async () => {
		connectionIs({});
		const onConsent = vi.fn().mockResolvedValue(undefined);
		await render(GitHubChallengePanel, { repoName, watch: null, needsConsent: true, onConsent });

		await page.getByRole('button', { name: 'Allow practice on GitHub' }).click();

		expect(onConsent).toHaveBeenCalledOnce();
	});

	it('shows the setup steps instead of the accept button when not signed in', async () => {
		connectionIs({ isSignedIn: false, login: null });
		await render(GitHubChallengePanel, {
			repoName,
			watch: null,
			needsConsent: true,
			onConsent: vi.fn()
		});

		await expect.element(page.getByText('gh auth login --scopes workflow')).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Check again' })).toBeVisible();
		await expect
			.element(page.getByRole('button', { name: 'Allow practice on GitHub' }))
			.not.toBeInTheDocument();
	});
});

describe('GitHubChallengePanel accessibility', () => {
	it('puts the check result inside the status region', async () => {
		connectionIs({ isSignedIn: false, login: null });
		await render(GitHubChallengePanel, {
			repoName,
			watch: null,
			needsConsent: true,
			onConsent: vi.fn()
		});

		await expect
			.element(
				page
					.getByRole('status')
					.filter({ hasText: 'The GitHub CLI is installed, but you are not signed in.' })
			)
			.toBeVisible();
	});

	it('says who is signed in when the CLI is ready', async () => {
		connectionIs({});
		await render(GitHubChallengePanel, {
			repoName,
			watch: null,
			needsConsent: true,
			onConsent: vi.fn()
		});

		await expect
			.element(
				page.getByRole('status').filter({ hasText: 'GitHub CLI ready, signed in as octocat.' })
			)
			.toBeVisible();
	});

	it('keeps "Check GitHub now" focusable while GitHub is being read', async () => {
		const { watch, readNow } = fakeWatch({ isReading: true });
		await render(GitHubChallengePanel, {
			repoName,
			watch,
			needsConsent: false,
			onConsent: vi.fn()
		});

		const button = page.getByRole('button', { name: 'Check GitHub now' });
		await expect.element(button).not.toHaveAttribute('disabled');
		await expect.element(button).toHaveAttribute('aria-disabled', 'true');
		await button.click({ force: true });
		expect(readNow).not.toHaveBeenCalled();
	});
});

describe('GitHubChallengePanel status', () => {
	it('says it is preparing while the watch is missing', async () => {
		await render(GitHubChallengePanel, {
			repoName,
			watch: null,
			needsConsent: false,
			onConsent: vi.fn()
		});

		await expect
			.element(page.getByText('Preparing your practice repository on GitHub…'))
			.toBeVisible();
	});

	it('shows the repository and reads GitHub on "Check GitHub now"', async () => {
		const { watch, readNow } = fakeWatch({});
		await render(GitHubChallengePanel, {
			repoName,
			watch,
			needsConsent: false,
			onConsent: vi.fn()
		});

		await expect.element(page.getByText('octocat/gitremastered-practice-flow')).toBeVisible();
		await page.getByRole('button', { name: 'Check GitHub now' }).click();

		expect(readNow).toHaveBeenCalledOnce();
	});

	it('shows a problem in words', async () => {
		const { watch } = fakeWatch({ problem: 'timed out' });
		await render(GitHubChallengePanel, {
			repoName,
			watch,
			needsConsent: false,
			onConsent: vi.fn()
		});

		await expect.element(page.getByText('Could not read GitHub: timed out')).toBeVisible();
	});
});
