<!--
  GitHubSection.svelte
  The "GitHub" card in Settings: why GitHub lessons need the GitHub CLI, whether it is
  connected, the guided setup, the practice consent, and deleting the practice repositories.
  Input: none.
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import GitHubSetupSteps from '$lib/components/github/GitHubSetupSteps.svelte';
	import { GitHubConnectionReader } from '$lib/components/github/github-connection.svelte';
	import { getGitHubConsent, revokeGitHubConsent } from '$lib/tauri/commands';
	import PracticeRepositoriesDelete from './PracticeRepositoriesDelete.svelte';

	const reader = new GitHubConnectionReader();

	/** The consent Rust keeps; only the app's own dialog can grant it. */
	let hasConsent = $state(false);

	/** Reads the consent from Rust (only in the desktop app). */
	async function readConsent(): Promise<void> {
		if (reader.isDesktopApp) {
			hasConsent = await getGitHubConsent();
		}
	}

	/** Takes the consent back and shows the new state. */
	async function takeBackConsent(): Promise<void> {
		await revokeGitHubConsent();
		await readConsent();
	}

	onMount(() => {
		void reader.check();
		void readConsent();
	});
</script>

<section aria-labelledby="github-heading" class="rounded-medium border bg-surface">
	<h2 id="github-heading" class="type-h3 m-0 border-b px-5 py-3.5">GitHub</h2>

	<div class="flex flex-col gap-3 px-5 py-4">
		<p class="type-small m-0 text-ink-muted">
			GitHub lessons practise on your own account through the GitHub CLI. The app uses your
			<code class="type-code">gh</code> login and never stores a password or token.
		</p>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<span class="font-semibold" role="status" aria-live="polite">
				{#if !reader.isDesktopApp}
					GitHub works in the desktop app.
				{:else if reader.connection === null}
					{reader.problem === null ? 'Checking…' : `Could not check: ${reader.problem}`}
				{:else if reader.isConnected}
					Connected as {reader.connection.login}
				{:else if reader.connection.isGhInstalled}
					The GitHub CLI is installed, but you are not signed in.
				{:else}
					The GitHub CLI is not installed.
				{/if}
			</span>
			{#if reader.isDesktopApp}
				<Button variant="secondary" onclick={() => reader.check()} disabled={reader.isChecking}>
					Check again
				</Button>
			{/if}
		</div>
		{#if reader.isDesktopApp && reader.connection !== null && !reader.isConnected}
			<GitHubSetupSteps />
		{/if}
	</div>

	<div class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4">
		<div>
			<div class="font-semibold">Practice on GitHub</div>
			<div class="type-small text-ink-muted">
				{hasConsent
					? 'Allowed: GitHub challenges may create and reset practice repositories on your account.'
					: 'Not allowed yet: you will be asked before the first GitHub challenge.'}
			</div>
		</div>
		{#if hasConsent}
			<Button variant="secondary" onclick={takeBackConsent}>Take back consent</Button>
		{/if}
	</div>

	{#if reader.isDesktopApp && reader.isConnected && reader.connection !== null}
		<PracticeRepositoriesDelete canDeleteRepos={reader.connection.canDeleteRepos} />
	{/if}
</section>
