<!--
  GitHubStatusLine.svelte
  The compact line under a GitHub challenge: which repository is watched, whether GitHub is
  being read right now, any problem in words, and a "Check GitHub now" button.
  One live region stays in the page and only its text changes. The automatic read every 20
  seconds is shown but not announced; only a read the student started, and a problem, are.
  Inputs: watch (the challenge's GitHubWatch, or null while the folder is still building).
  Output: focusStatus() moves focus to the status line (used after consent is given).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { GitHubWatch } from '$lib/mission-engine/github-watch.svelte';

	let { watch }: { watch: GitHubWatch | null } = $props();

	let statusElement: HTMLElement | null = $state(null);

	/** True while a read that the student started with the button is running. */
	let isStudentRead = $state(false);

	/** Moves keyboard focus to the status line. */
	export function focusStatus(): void {
		statusElement?.focus();
	}

	/** Reads GitHub now. Does nothing while a read is already running (the button stays focusable). */
	async function checkNow(): Promise<void> {
		if (watch === null || watch.isReading) {
			return;
		}
		isStudentRead = true;
		try {
			await watch.readNow();
		} finally {
			isStudentRead = false;
		}
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-2">
	<div
		bind:this={statusElement}
		class="type-small rounded-small focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
		role="status"
		aria-live="polite"
		tabindex="-1"
	>
		{#if watch === null}
			<span class="text-ink-muted">Preparing your practice repository on GitHub…</span>
		{:else}
			<span class="font-semibold">GitHub:</span>
			{#if watch.context !== null}
				<code class="type-code">{watch.context.state.repo}</code>
			{/if}
			{#if watch.isReading}
				<!-- Hidden from screen readers unless the student asked for this read. -->
				<span class="text-ink-muted" aria-hidden={isStudentRead ? undefined : 'true'}>
					Checking GitHub…
				</span>
			{/if}
			{#if watch.problem !== null}
				<div>Could not read GitHub: {watch.problem}</div>
			{/if}
		{/if}
	</div>
	{#if watch !== null}
		<Button variant="secondary" onclick={checkNow} aria-disabled={watch.isReading}>
			Check GitHub now
		</Button>
	{/if}
</div>
