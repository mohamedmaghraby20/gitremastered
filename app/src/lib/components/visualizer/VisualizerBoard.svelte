<!--
  VisualizerBoard.svelte
  The dotted drawing board from DESIGN.md: the files desk on top, the history map in the
  middle (passed in as "history"), and the caption bar at the bottom.

  Inputs: snapshot (repo state or null), caption (last command's caption or null),
          history (optional: the history map).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import type { CommandCaption } from '$lib/visualizer/explain-command';
	import AreaDesk from './AreaDesk.svelte';
	import CaptionBar from './CaptionBar.svelte';

	let {
		snapshot,
		caption,
		history
	}: { snapshot: RepoSnapshot | null; caption: CommandCaption | null; history?: Snippet } =
		$props();

	const branchLabel = $derived.by(() => {
		if (snapshot === null) {
			return 'waiting for the practice repo';
		}
		if (snapshot.head.kind === 'detached') {
			return `HEAD detached at ${snapshot.head.commitId.slice(0, 7)}`;
		}
		return `on branch ${snapshot.head.branchName}`;
	});
</script>

<section
	aria-label="Visualizer"
	class="visualizer-board flex min-h-0 flex-1 flex-col overflow-hidden rounded-large border bg-surface-sunken"
>
	<div class="type-caption flex justify-between px-3.5 pt-2.5 text-ink-muted uppercase">
		<span>Files</span>
		<span class="type-label-mono text-ink-faint normal-case">{branchLabel}</span>
	</div>
	<div class="px-3.5 pt-2.5 pb-3">
		<AreaDesk {snapshot} />
	</div>
	<div class="flex min-h-0 flex-1 flex-col border-t bg-surface">
		{#if history}
			{@render history()}
		{/if}
		<div class="mt-auto">
			<CaptionBar {caption} />
		</div>
	</div>
</section>

<style>
	/* The dotted drawing-board background. */
	.visualizer-board {
		background-image: radial-gradient(var(--border) 1px, transparent 1.2px);
		background-size: var(--space-4) var(--space-4);
	}
</style>
