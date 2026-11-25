<!--
  CommitStation.svelte
  One station on the history map (a Svelte Flow node): a ring for the commit, its short ID and
  message, the branch label beside it, and the yellow "HEAD · you" pin above when HEAD is here.
  The faded, dashed station stands for the next commit.

  Input (from Svelte Flow): data, the station's StationData.
-->
<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { StationData } from '$lib/visualizer/history-layout';

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
	<span
		class={[
			'type-label-mono rounded-small border px-1.5 font-bold',
			station.isHead
				? 'border-git-staging-edge bg-highlight text-on-highlight'
				: 'invisible border-transparent'
		]}
	>
		HEAD · you
	</span>
	<span
		class={[
			'relative size-5 rounded-full bg-surface',
			station.isNextCommit
				? 'border-2 border-dashed border-git-branch'
				: 'border-4 border-git-branch'
		]}
		aria-hidden="true"
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
	{#each station.branchNames as branchName (branchName)}
		<span
			class="type-label-mono rounded-small bg-git-branch px-1.5 font-bold text-on-git-repository"
		>
			{branchName}
		</span>
	{/each}
</div>
