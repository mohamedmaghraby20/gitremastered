<!--
  GitHubChallengePanel.svelte
  The GitHub part of the challenge panel: the consent card before the student agreed,
  and afterwards the status line with "Check GitHub now". When the card is replaced by the
  status line, focus moves to the status line so keyboard users do not lose their place.
  Inputs: repoName, watch (the challenge's GitHubWatch or null), needsConsent, onConsent.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { GitHubWatch } from '$lib/practice/github-watch.svelte';
	import GitHubConsentCard from './GitHubConsentCard.svelte';
	import GitHubStatusLine from './GitHubStatusLine.svelte';

	let {
		repoName,
		watch,
		needsConsent,
		onConsent
	}: {
		repoName: string;
		watch: GitHubWatch | null;
		needsConsent: boolean;
		onConsent: () => Promise<void>;
	} = $props();

	let statusLine: { focusStatus: () => void } | null = $state(null);

	/** Passes the consent on, then focuses the status line that replaces the card. */
	async function consentAndFocus(): Promise<void> {
		await onConsent();
		await tick();
		statusLine?.focusStatus();
	}
</script>

{#if needsConsent}
	<GitHubConsentCard {repoName} onConsent={consentAndFocus} />
{:else}
	<GitHubStatusLine bind:this={statusLine} {watch} />
{/if}
