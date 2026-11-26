<!--
  FileSheet.svelte
  One file as a paper sheet on the desk, in its zone's look (DESIGN.md "draft → highlighted"):
  dashed edges in the working tree, a highlighter stripe in the staging area.
  A sheet that just arrived gets a brief outline (instant with "reduce motion").

  Inputs: path, label (the small word: new, edited…), zone ("working" or "staging"),
          isJustMoved (true right after the file arrived in this zone).
-->
<script lang="ts">
	import type { FileSheetInfo } from '$lib/visualizer/area-zones';

	let {
		path,
		label,
		zone,
		isJustMoved
	}: {
		path: string;
		label: FileSheetInfo['label'];
		zone: 'working' | 'staging';
		isJustMoved: boolean;
	} = $props();
</script>

<li
	class={[
		'file-sheet type-label-mono flex items-center justify-between gap-2 rounded-small bg-surface px-1.5 py-0.5',
		zone === 'working'
			? 'border border-dashed border-git-working'
			: 'border border-git-staging-edge',
		zone === 'staging' && 'staged-stripe',
		isJustMoved && 'just-moved'
	]}
	data-just-moved={isJustMoved}
>
	<span class="truncate">{path}</span>
	<span class="type-caption text-ink-muted uppercase">{label}</span>
</li>

<style>
	/* The highlighter stripe across the lower part of a staged sheet. */
	.staged-stripe {
		background: linear-gradient(transparent 58%, var(--git-staging) 58%) var(--surface);
		color: var(--on-highlight);
	}

	/* The brief outline on a sheet that just moved; its length follows the motion token. */
	.just-moved {
		animation: arrival-outline calc(var(--duration-visual) * 4) ease-out;
	}

	@keyframes arrival-outline {
		from {
			outline: 2px solid var(--git-staging-edge);
			outline-offset: 2px;
		}
		to {
			outline: 2px solid transparent;
			outline-offset: 2px;
		}
	}
</style>
