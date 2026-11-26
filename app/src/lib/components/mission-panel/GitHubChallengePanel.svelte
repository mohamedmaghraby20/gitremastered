<!--
  GitHubChallengePanel.svelte
  The GitHub part of a challenge's mission panel: the consent card before the student agreed,
  and afterwards the status line with "Check GitHub now".
  Inputs: repoName, watch (the challenge's GitHubWatch or null), needsConsent, onConsent.
-->
<script lang="ts">
	import type { GitHubWatch } from '$lib/mission-engine/github-watch.svelte';
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
</script>

{#if needsConsent}
	<GitHubConsentCard {repoName} {onConsent} />
{:else}
	<GitHubStatusLine {watch} />
{/if}
