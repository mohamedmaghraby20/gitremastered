<!--
  GitHubSection.svelte
  The "GitHub" card in Settings: why GitHub lessons need the GitHub CLI, whether it is
  connected, the guided setup, the practice consent, and deleting the practice repositories.
  Input: none.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
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

	/** The consent text region; focus moves here after the consent is taken back. */
	let consentStatusElement: HTMLElement | null = $state(null);

	/** What went wrong when taking the consent back, in words, or null. */
	let consentProblem: string | null = $state(null);

	/** The sentence that says whether practice on GitHub is allowed. */
	const consentText = $derived(
		hasConsent
			? 'Allowed: GitHub challenges may create and reset practice repositories on your account.'
			: 'Not allowed yet: you will be asked before the first GitHub challenge.'
	);

	/** Takes the consent back, shows the new state, and moves focus to it. */
	async function takeBackConsent(): Promise<void> {
		consentProblem = null;
		try {
			await revokeGitHubConsent();
			await readConsent();
		} catch (error) {
			consentProblem = `Could not take back your consent: ${String(error)}`;
		}
		await tick();
		consentStatusElement?.focus();
	}

	/** Reads the GitHub CLI again. Does nothing while a read runs (the button stays focusable). */
	async function checkAgain(): Promise<void> {
		if (reader.isChecking) {
			return;
		}
		await reader.check();
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
				<Button variant="secondary" onclick={checkAgain} aria-disabled={reader.isChecking}>
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
			<h3 class="m-0 font-semibold">Practice on GitHub</h3>
			<div
				bind:this={consentStatusElement}
				class="type-small rounded-small text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
				role="status"
				aria-live="polite"
				tabindex="-1"
			>
				{consentProblem ?? consentText}
			</div>
		</div>
		<!-- The button area stays in the page, so focus has somewhere to be after taking consent back. -->
		<div>
			{#if hasConsent}
				<Button variant="secondary" onclick={takeBackConsent}>Take back consent</Button>
			{/if}
		</div>
	</div>

	{#if reader.isDesktopApp && reader.isConnected && reader.connection !== null}
		<PracticeRepositoriesDelete canDeleteRepos={reader.connection.canDeleteRepos} />
	{/if}
</section>
