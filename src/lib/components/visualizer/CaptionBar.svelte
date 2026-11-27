<!--
  CaptionBar.svelte
  The bar under the visualizer that explains the last command in one sentence.
  It is a live region, so screen readers announce each new explanation.

  Input: caption (the last command and its explanation, or null before the first one).
-->
<script lang="ts">
	import type { CommandCaption } from '$lib/visualizer/explain-command';

	let { caption }: { caption: CommandCaption | null } = $props();
</script>

<div class="flex items-baseline gap-2.5 border-t bg-surface px-3.5 py-2.5" aria-live="polite">
	<span class="type-caption text-ink-faint uppercase">Last</span>
	{#if caption === null}
		<span class="type-sidenote text-ink-muted">
			Run a Git command in the terminal to see what it does.
		</span>
	{:else}
		<code class="type-label-mono rounded-small border bg-surface-sunken px-1.5 whitespace-nowrap">
			{caption.commandLine}
		</code>
		<span class="type-small min-w-0 font-serif">{caption.explanation}</span>
	{/if}
</div>
