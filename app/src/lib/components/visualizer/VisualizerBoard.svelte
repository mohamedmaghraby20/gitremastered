<!--
  VisualizerBoard.svelte
  The dotted drawing board from DESIGN.md: the files desk on top, the history map in the
  middle (passed in as "history"), and the caption bar at the bottom.

  The "Files" header folds the desk away, for more room for the history map.

  Inputs: snapshot (repo state or null), caption (last command's caption or null),
          history (optional: the history map), isDeskFolded (optional: start folded),
          onDeskToggle (optional: called with the new folded state, to remember it).
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
		history,
		isDeskFolded = false,
		onDeskToggle = () => {}
	}: {
		snapshot: RepoSnapshot | null;
		caption: CommandCaption | null;
		history?: Snippet;
		isDeskFolded?: boolean;
		onDeskToggle?: (isFolded: boolean) => void;
	} = $props();

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
	<div class="flex items-center justify-between px-3.5 pt-1.5">
		<button
			type="button"
			class="type-caption -ml-1 flex items-center gap-1 rounded-small px-1 py-0.5 text-ink-muted uppercase hover:text-ink"
			aria-expanded={!isDeskFolded}
			aria-controls="files-desk"
			onclick={() => onDeskToggle(!isDeskFolded)}
		>
			<span aria-hidden="true">{isDeskFolded ? '▸' : '▾'}</span>
			Files
		</button>
		<span class="type-label-mono text-ink-faint">{branchLabel}</span>
	</div>
	<div id="files-desk" class="px-3.5 pt-1 pb-2.5" hidden={isDeskFolded}>
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
