<!--
  CommitStation.svelte
  One station on the history map (a Svelte Flow node): a ring for the commit with its short ID and
  message below, and above it the labels pinned to this commit (RefLabels: the HEAD pin and
  the branch tags). The faded, dashed station stands for the next commit.

  Input (from Svelte Flow): data, the station's StationData.
-->
<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { StationData } from '$lib/visualizer/history-layout';
	import RefLabels from './RefLabels.svelte';

	let { data }: NodeProps = $props();

	const station = $derived(data as StationData);
</script>

<div
	class={[
		'flex w-28 flex-col items-center gap-1 text-center',
		station.isNextCommit && 'opacity-60'
	]}
	data-testid="commit-station"
>
	<!-- The labels sit above the commit, like tags pinned to it. An empty row keeps every ring
	     at the same height, so the track stays straight. -->
	<div class="flex flex-wrap justify-center gap-1" data-testid="station-labels">
		<RefLabels isHead={station.isHead} branchNames={station.branchNames} />
		{#if !station.isHead && station.branchNames.length === 0}
			<span class="type-label-mono invisible px-1.5" aria-hidden="true">·</span>
		{/if}
	</div>
	<span
		class={[
			'relative size-5 rounded-full bg-surface',
			station.isNextCommit
				? 'border-2 border-dashed border-git-branch'
				: 'border-4 border-git-branch'
		]}
		aria-hidden="true"
		data-testid="station-ring"
	>
		<!-- Invisible connection points inside the ring: tracks enter left and leave right. -->
		<Handle type="target" position={Position.Left} class="opacity-0" isConnectable={false} />
		<Handle type="source" position={Position.Right} class="opacity-0" isConnectable={false} />
	</span>
	{#if station.isNextCommit}
		<span class="type-caption text-ink-muted normal-case">{station.message}</span>
	{:else}
		<span class="type-label-mono">{station.shortId}</span>
		<span class="type-caption w-full truncate text-ink-muted normal-case">{station.message}</span>
	{/if}
</div>
