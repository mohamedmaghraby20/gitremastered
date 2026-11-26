<!--
  GitHubStatusLine.svelte
  The compact line under a GitHub challenge: which repository is watched, whether GitHub is
  being read right now, any problem in words, and a "Check GitHub now" button.
  Inputs: watch (the challenge's GitHubWatch, or null while the folder is still building).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { GitHubWatch } from '$lib/mission-engine/github-watch.svelte';

	let { watch }: { watch: GitHubWatch | null } = $props();
</script>

{#if watch === null}
	<p class="type-small m-0 text-ink-muted" role="status">
		Preparing your practice repository on GitHub…
	</p>
{:else}
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="type-small" role="status" aria-live="polite">
			<span class="font-semibold">GitHub:</span>
			{#if watch.context !== null}
				<code class="type-code">{watch.context.state.repo}</code>
			{/if}
			{#if watch.isReading}
				<span class="text-ink-muted">Checking GitHub…</span>
			{/if}
			{#if watch.problem !== null}
				<div>Could not read GitHub: {watch.problem}</div>
			{/if}
		</div>
		<Button variant="secondary" onclick={() => watch.readNow()} disabled={watch.isReading}>
			Check GitHub now
		</Button>
	</div>
{/if}
