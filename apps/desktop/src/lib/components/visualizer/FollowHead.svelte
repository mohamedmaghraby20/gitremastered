<!--
  FollowHead.svelte
  Lives inside the history map's Svelte Flow and moves its view after every change: the whole
  history while it fits at a readable zoom, otherwise centered on HEAD and the next commit
  (history-view.ts decides). It draws nothing itself.

  Inputs: stations (the placed stations; a new list means the map changed),
          viewSize (the map area's width and height in pixels).
-->
<script lang="ts">
	import { useSvelteFlow } from '@xyflow/svelte';
	import type { PlacedStation } from '$lib/visualizer/history-layout';
	import { chooseHistoryView } from '$lib/visualizer/history-view';
	import { isMotionReduced } from '$lib/settings/display-settings';

	let {
		stations,
		viewSize
	}: { stations: PlacedStation[]; viewSize: { width: number; height: number } } = $props();

	const flow = useSvelteFlow();

	/**
	 * How long the view glides to its new place: the "base" duration token, or 0 with reduce motion.
	 * @returns milliseconds
	 */
	function readGlideDuration(): number {
		if (isMotionReduced()) {
			return 0;
		}
		return (
			parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-base')) ||
			0
		);
	}

	/** Moves the view to show the whole history, or HEAD at a readable zoom. */
	function showChosenView(): void {
		const view = chooseHistoryView(stations, viewSize);
		const duration = readGlideDuration();
		if (view.kind === 'fit-all') {
			void flow.fitView({ maxZoom: 1, padding: 0.15, duration });
		} else {
			void flow.setCenter(view.x, view.y, { zoom: view.zoom, duration });
		}
	}

	// After the stations change (and Svelte Flow has placed them), move the view.
	$effect(() => {
		void stations;
		void viewSize.width;
		void viewSize.height;
		const frame = requestAnimationFrame(showChosenView);
		return () => cancelAnimationFrame(frame);
	});
</script>
