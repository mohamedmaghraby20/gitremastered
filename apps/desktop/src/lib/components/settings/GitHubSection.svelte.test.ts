/**
 * GitHubSection.svelte.test.ts
 * Component tests for the Settings GitHub card: connection states, the missing delete
 * permission, taking consent back, and the delete confirm flow.
 */

import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	deletePracticeRepositories,
	getGitHubConnection,
	getGitHubConsent,
	listPracticeRepositories,
	revokeGitHubConsent
} from '$lib/tauri/commands';
import type { GitHubConnection } from '@gitremastered/course-engine/types/github';
import GitHubSection from './GitHubSection.svelte';

vi.mock('@tauri-apps/api/core', () => ({ isTauri: () => true }));
vi.mock('$lib/tauri/commands', () => ({
	getGitHubConnection: vi.fn(),
	listPracticeRepositories: vi.fn(),
	deletePracticeRepositories: vi.fn(),
	getGitHubConsent: vi.fn(),
	revokeGitHubConsent: vi.fn()
}));

/**
 * Makes the fake GitHub CLI answer with the given connection.
 * @param changes - the fields that differ from a fully connected account
 */
function connectionIs(changes: Partial<GitHubConnection>): void {
	vi.mocked(getGitHubConnection).mockResolvedValue({
		isGhInstalled: true,
		isSignedIn: true,
		login: 'octocat',
		canDeleteRepos: true,
		...changes
	});
}

describe('GitHubSection', () => {
	beforeEach(() => {
		vi.mocked(getGitHubConsent).mockResolvedValue(false);
		vi.mocked(revokeGitHubConsent).mockResolvedValue();
		vi.mocked(listPracticeRepositories).mockResolvedValue(['gitremastered-practice-flow']);
		vi.mocked(deletePracticeRepositories).mockResolvedValue(['gitremastered-practice-flow']);
	});

	it('shows "Connected as" and no setup steps when connected', async () => {
		connectionIs({});
		await render(GitHubSection);

		await expect.element(page.getByText('Connected as octocat')).toBeVisible();
		await expect.element(page.getByText('gh auth login')).not.toBeInTheDocument();
	});

	it('shows the setup steps when the CLI is missing', async () => {
		connectionIs({ isGhInstalled: false, isSignedIn: false, login: null });
		await render(GitHubSection);

		await expect.element(page.getByText('The GitHub CLI is not installed.')).toBeVisible();
		await expect.element(page.getByText('winget install --id GitHub.cli')).toBeVisible();
	});

	it('shows the refresh command when the delete permission is missing', async () => {
		connectionIs({ canDeleteRepos: false });
		await render(GitHubSection);

		await expect
			.element(page.getByText('gh auth refresh -h github.com -s delete_repo'))
			.toBeVisible();
	});

	it('takes consent back through Rust', async () => {
		connectionIs({});
		vi.mocked(getGitHubConsent).mockResolvedValueOnce(true).mockResolvedValue(false);
		await render(GitHubSection);

		await page.getByRole('button', { name: 'Take back consent' }).click();

		expect(revokeGitHubConsent).toHaveBeenCalled();
		await expect.element(page.getByText(/Not allowed yet/)).toBeVisible();
	});

	it('lists, asks to confirm, then deletes the practice repositories', async () => {
		connectionIs({});
		await render(GitHubSection);

		await page.getByRole('button', { name: 'Show my practice repositories' }).click();
		await expect.element(page.getByText('gitremastered-practice-flow')).toBeVisible();
		await page.getByRole('button', { name: 'Delete these repositories…' }).click();
		await expect.element(page.getByText(/cannot be undone/)).toBeVisible();
		expect(deletePracticeRepositories).not.toHaveBeenCalled();

		await page.getByRole('button', { name: 'Yes, delete them' }).click();

		expect(deletePracticeRepositories).toHaveBeenCalledWith(['gitremastered-practice-flow']);
		await expect.element(page.getByText('Deleted: gitremastered-practice-flow.')).toBeVisible();
	});

	it('moves focus to Cancel when the confirm question opens', async () => {
		connectionIs({});
		await render(GitHubSection);
		await page.getByRole('button', { name: 'Show my practice repositories' }).click();
		await page.getByRole('button', { name: 'Delete these repositories…' }).click();

		await expect.element(page.getByRole('button', { name: 'Cancel' })).toHaveFocus();
	});

	it('puts focus back on the delete button after Cancel', async () => {
		connectionIs({});
		await render(GitHubSection);
		await page.getByRole('button', { name: 'Show my practice repositories' }).click();
		await page.getByRole('button', { name: 'Delete these repositories…' }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();

		await expect
			.element(page.getByRole('button', { name: 'Delete these repositories…' }))
			.toHaveFocus();
	});

	it('announces how many repositories were found', async () => {
		connectionIs({});
		await render(GitHubSection);
		await page.getByRole('button', { name: 'Show my practice repositories' }).click();

		await expect
			.element(page.getByRole('status').filter({ hasText: 'Found 1 practice repository.' }))
			.toBeVisible();
	});

	it('keeps the "Check again" button focusable while reading', async () => {
		connectionIs({});
		await render(GitHubSection);

		await expect
			.element(page.getByRole('button', { name: 'Check again' }))
			.not.toHaveAttribute('disabled');
	});
});
