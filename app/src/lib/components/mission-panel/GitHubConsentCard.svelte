<!--
  GitHubConsentCard.svelte
  The one-time consent screen before a GitHub challenge. It says exactly what the app does on
  the student's GitHub account. If the GitHub CLI is missing or not signed in, it shows the
  setup steps and a "Check again" button instead of the accept button.
  Inputs: repoName (this challenge's practice repository), onConsent (called on accept).
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import GitHubSetupSteps from '$lib/components/github/GitHubSetupSteps.svelte';
	import { GitHubConnectionReader } from '$lib/components/github/github-connection.svelte';

	let { repoName, onConsent }: { repoName: string; onConsent: () => Promise<void> } = $props();

	const reader = new GitHubConnectionReader();
	let isAccepting = $state(false);

	onMount(() => {
		void reader.check();
	});

	/** Passes the student's yes on, with a busy state while it is saved. */
	async function accept(): Promise<void> {
		isAccepting = true;
		try {
			await onConsent();
		} finally {
			isAccepting = false;
		}
	}
</script>

<section
	aria-labelledby="github-consent-heading"
	class="flex flex-col gap-3 rounded-medium border bg-surface-sunken p-4"
>
	<h3 id="github-consent-heading" class="type-h3 m-0">Practice on your GitHub account</h3>
	<p class="type-small m-0">
		This challenge uses your own GitHub account through the GitHub CLI (<code class="type-code">
			gh
		</code>). If you allow it, the app will:
	</p>
	<ul class="type-small m-0 flex flex-col gap-1 pl-5">
		<li>
			create a public repository named <code class="type-code">{repoName}</code> on your account
			(and other <code class="type-code">gitremastered-practice…</code> repositories for later lessons);
		</li>
		<li>
			push practice commits to it, and on each start or reset replace everything in it with the
			challenge's starting state;
		</li>
		<li>
			open, comment on and merge practice pull requests and issues as "a teammate", from your own
			account;
		</li>
		<li>
			on each start or reset, close open pull requests and issues, and delete releases and rules, in
			those repositories only.
		</li>
	</ul>
	<p class="type-small m-0">
		It never touches any other repository, and never changes your account settings, keys or
		organizations. It uses your own <code class="type-code">gh</code> login and stores no token. You can
		delete all practice repositories later in Settings, GitHub.
	</p>

	<div role="status" aria-live="polite">
		{#if !reader.isDesktopApp}
			<p class="type-small m-0 text-ink-muted">GitHub challenges work in the desktop app.</p>
		{:else if reader.isChecking && reader.connection === null}
			<p class="type-small m-0 text-ink-muted">Checking the GitHub CLI…</p>
		{:else if reader.problem !== null}
			<p class="type-small m-0">Could not check the GitHub CLI: {reader.problem}</p>
		{/if}
	</div>

	{#if reader.isDesktopApp && reader.connection !== null}
		{#if reader.isConnected}
			<div>
				<Button onclick={accept} disabled={isAccepting}>
					{isAccepting ? 'Saving…' : 'Allow practice on GitHub'}
				</Button>
			</div>
		{:else}
			<p class="type-small m-0 font-semibold">
				{reader.connection.isGhInstalled
					? 'The GitHub CLI is installed, but you are not signed in.'
					: 'The GitHub CLI is not installed.'}
			</p>
			<GitHubSetupSteps />
			<div>
				<Button variant="secondary" onclick={() => reader.check()} disabled={reader.isChecking}>
					Check again
				</Button>
			</div>
		{/if}
	{/if}
</section>
