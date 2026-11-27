<!--
  CommitStation.svelte
  One station on the history map (a Svelte Flow node): a ring for the commit with its short ID and
  message below, and above it the labels pinned to this commit (RefLabels: the HEAD pin and
  the branch, remote and tag labels).

  Two kinds of station are faded with a dashed ring:
  - the "next commit" station, for the commit you have not made yet;
  - a commit no branch reaches any more (after an amend or a reset), marked "no branch".

  The label area and the ring have fixed heights, so every ring in a row sits at the same
  height and the track between them stays straight.

  Input (from Svelte Flow): data, the station's StationData.
-->
<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { StationData } from '$lib/visualizer/history-layout';
	import RefLabels from './RefLabels.svelte';

	let { data }: NodeProps = $props();

	const station = $derived(data as StationData);
	const isFaded = $derived(station.isNextCommit || station.isUnreachable);
</script>

<div
	class={['flex w-28 flex-col items-center gap-1 text-center', isFaded && 'opacity-60']}
	data-testid="commit-station"
	data-unreachable={station.isUnreachable}
>
	<!-- The labels sit above the commit, like tags pinned to it. They fill the area from the
	     bottom up, so the ring below never moves. -->
	<div class="flex h-14 flex-wrap content-end justify-center gap-1" data-testid="station-labels">
		<RefLabels
			isHead={station.isHead}
			isHeadDetached={station.isHeadDetached}
			branchNames={station.branchNames}
			remoteBranchNames={station.remoteBranchNames}
			tagNames={station.tagNames}
		/>
	</div>
	<span
		class={[
			'relative size-5 rounded-full bg-surface',
			isFaded ? 'border-2 border-dashed border-git-branch' : 'border-4 border-git-branch'
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
		<span class="type-label-mono">
			{station.shortId}
			{#if station.isUnreachable}
				<span class="text-ink-muted" title="No branch reaches this commit any more">
					· no branch
				</span>
			{/if}
		</span>
		<span class="type-caption w-full truncate text-ink-muted normal-case">{station.message}</span>
	{/if}
</div>
