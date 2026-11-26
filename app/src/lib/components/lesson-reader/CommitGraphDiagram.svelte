<!--
  CommitGraphDiagram.svelte
  A ":::graph" lesson block: a small, still commit diagram in the history map's style. Commits
  are rings on a track (oldest on the left), each line of work has its own row, and HEAD,
  branch, remote and tag labels sit above their commit. A faded, dashed ring is a commit no
  branch reaches any more. Wide diagrams scroll sideways inside their box.

  Screen readers get the whole diagram as one described image (see describeGraph).

  Input: graph, the checked block from parse-graph-block.ts.
-->
<script lang="ts">
	import type { CommitGraph } from '$lib/types/commit-graph';
	import { buildGraphDiagram, diagramGrid } from '$lib/visualizer/graph-diagram';
	import RefLabels from '$lib/components/visualizer/RefLabels.svelte';

	let { graph }: { graph: CommitGraph } = $props();

	const diagram = $derived(buildGraphDiagram(graph));

	/** Each commit's box is this wide, centered on its ring. */
	const commitBoxWidth = diagramGrid.columnStep - 8;
</script>

<figure class="m-0 flex flex-col gap-2 rounded-medium border bg-surface-sunken px-3 py-3">
	<div class="overflow-x-auto">
		<div
			role="img"
			aria-label={diagram.description}
			class="relative"
			style:width={`${diagram.width}px`}
			style:height={`${diagram.height}px`}
		>
			<svg
				class="absolute inset-0"
				width={diagram.width}
				height={diagram.height}
				aria-hidden="true"
			>
				{#each diagram.tracks as track (track.id)}
					<path d={track.path} class={['track', track.isFaded && 'track-faded']} />
				{/each}
			</svg>
			{#each diagram.commits as commit (commit.id)}
				<div
					class={['absolute flex flex-col items-center', commit.isFaded && 'opacity-60']}
					style:left={`${commit.x - commitBoxWidth / 2}px`}
					style:top={`${commit.y}px`}
					style:width={`${commitBoxWidth}px`}
					aria-hidden="true"
					data-testid="graph-commit"
				>
					<!-- Labels sit above the ring and grow upward, so the ring never moves. -->
					<div class="absolute bottom-full mb-3.5 flex flex-wrap justify-center gap-1">
						<RefLabels
							isHead={commit.isHead}
							isHeadDetached={commit.isHeadDetached}
							branchNames={commit.branchNames}
							remoteBranchNames={commit.remoteBranchNames}
							tagNames={commit.tagNames}
						/>
					</div>
					<span
						class={[
							'-mt-2.5 size-5 rounded-full bg-surface',
							commit.isFaded
								? 'border-2 border-dashed border-git-branch'
								: 'border-4 border-git-branch'
						]}
					></span>
					<span class="type-label-mono mt-1">{commit.id}</span>
					<span class="type-caption w-full truncate text-center text-ink-muted normal-case">
						{commit.message}
					</span>
				</div>
			{/each}
		</div>
	</div>
	<figcaption class="type-small text-ink-muted">{graph.caption}</figcaption>
</figure>

<style>
	/* The same track as the live history map: solid and thick. */
	.track {
		fill: none;
		stroke: var(--git-branch);
		stroke-width: 4px;
		stroke-linecap: round;
	}

	/* The track to a commit no branch reaches any more: thin, dashed and faded. */
	.track-faded {
		stroke-width: 2px;
		stroke-dasharray: 3 5;
		opacity: 0.5;
	}
</style>
