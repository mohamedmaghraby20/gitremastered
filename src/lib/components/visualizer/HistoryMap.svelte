<!--
  HistoryMap.svelte
  The metro-map history from DESIGN.md, drawn with Svelte Flow: commits as stations on a solid
  track, oldest on the left, one row per line of work, HEAD and the branch, remote and tag
  labels on their station, and a dashed track to the faded "next commit" station. A commit no
  branch reaches any more keeps its place, faded. Placement comes from history-layout.ts.
  The map is for looking only: no dragging, connecting or selecting. It can be zoomed with
  the buttons, the mouse wheel or a trackpad pinch, and dragged to look around. After each
  change the view shows the whole history, or follows HEAD once the history is too long to
  read whole (FollowHead).

  Inputs: snapshot (the repo state, or null while it loads),
          headerAside (optional: shown at the right of the "History" heading, e.g. Expand),
          headingLevel (optional: 3 by default; 2 when the map is the main thing on screen).
-->
<script lang="ts">
	import '@xyflow/svelte/dist/style.css';
	import type { Snippet } from 'svelte';
	import { Controls, SvelteFlow, type Edge, type Node } from '@xyflow/svelte';
	import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
	import {
		buildHistoryGraph,
		placeStations,
		type PlacedStation
	} from '$lib/visualizer/history-layout';
	import CommitStation from './CommitStation.svelte';
	import FollowHead from './FollowHead.svelte';

	let {
		snapshot,
		headerAside,
		headingLevel = 3
	}: { snapshot: RepoSnapshot | null; headerAside?: Snippet; headingLevel?: 2 | 3 } = $props();

	const nodeTypes = { station: CommitStation };

	/** How far the map zooms out (to see long histories) and in (to read labels). */
	const zoomLimits = { minZoom: 0.25, maxZoom: 2 };

	let nodes: Node[] = $state.raw([]);
	let edges: Edge[] = $state.raw([]);
	let placedStations: PlacedStation[] = $state.raw([]);
	let mapWidth = $state(0);
	let mapHeight = $state(0);

	/** The CSS class of each kind of track. */
	const trackClasses = {
		commit: 'commit-track',
		'next-commit': 'next-track',
		unreachable: 'lost-track'
	};

	/**
	 * Builds and places the map for a snapshot, then hands it to Svelte Flow.
	 * @param currentSnapshot - the repo state
	 */
	function drawHistory(currentSnapshot: RepoSnapshot): void {
		const graph = buildHistoryGraph(currentSnapshot);
		const newStations = placeStations(graph, currentSnapshot);
		const rowOfStation = new Map(newStations.map((station) => [station.id, station.y]));
		placedStations = newStations;
		nodes = newStations.map((station) => ({
			id: station.id,
			type: 'station',
			position: { x: station.x, y: station.y },
			data: station.data,
			draggable: false,
			selectable: false
		}));
		edges = graph.tracks.map((track) => ({
			id: track.id,
			source: track.fromId,
			target: track.toId,
			// Inside one row the track is straight; between rows it bends, like a line changing level.
			type:
				rowOfStation.get(track.fromId) === rowOfStation.get(track.toId) ? 'straight' : 'default',
			class: trackClasses[track.kind],
			selectable: false
		}));
	}

	$effect(() => {
		if (snapshot !== null) {
			drawHistory(snapshot);
		}
	});
</script>

<section aria-label="History" class="history-map flex min-h-40 flex-1 flex-col">
	<div class="flex items-center justify-between gap-2 px-3.5 pt-2">
		<svelte:element this={`h${headingLevel}`} class="type-caption m-0 text-ink-muted uppercase">
			History
		</svelte:element>
		{@render headerAside?.()}
	</div>
	<div class="min-h-0 flex-1" bind:clientWidth={mapWidth} bind:clientHeight={mapHeight}>
		<SvelteFlow
			bind:nodes
			bind:edges
			{nodeTypes}
			{...zoomLimits}
			proOptions={{ hideAttribution: true }}
			nodesDraggable={false}
			nodesConnectable={false}
			elementsSelectable={false}
		>
			<Controls showLock={false} orientation="horizontal" position="bottom-left" />
			<FollowHead stations={placedStations} viewSize={{ width: mapWidth, height: mapHeight }} />
		</SvelteFlow>
	</div>
</section>

<style>
	/* Svelte Flow draws on a transparent background so the board shows through. */
	.history-map :global(.svelte-flow) {
		--xy-background-color: transparent;
		--xy-node-background-color-default: transparent;
		--xy-node-border-default: none;
	}

	/* The zoom buttons in our tokens instead of Svelte Flow's own colors. */
	.history-map :global(.svelte-flow__controls) {
		--xy-controls-button-background-color: var(--surface);
		--xy-controls-button-background-color-hover: var(--surface-sunken);
		--xy-controls-button-color: var(--ink);
		--xy-controls-button-color-hover: var(--ink);
		--xy-controls-button-border-color: var(--border);
		--xy-controls-box-shadow: none;
		border: 1px solid var(--border);
		border-radius: var(--radius-small);
		overflow: hidden;
	}

	/* The current branch line: solid and thick. */
	.history-map :global(.commit-track path) {
		stroke: var(--git-branch);
		stroke-width: 4px;
		stroke-linecap: round;
	}

	/* The lines to the commit you have not made yet and to commits no branch reaches:
	   thin, dashed and faded. */
	.history-map :global(.next-track path),
	.history-map :global(.lost-track path) {
		stroke: var(--git-branch);
		stroke-width: 2px;
		stroke-dasharray: 3 5;
		opacity: 0.5;
	}
</style>
