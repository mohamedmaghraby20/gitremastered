<!--
  PracticePreview.svelte
  The continue card's side panel: the practice repository's three areas, drawn by the same
  files desk as in the lesson, and one sentence saying where things stand.

  Input: snapshot (the practice repository's state, or null when it is not built or the app
         runs outside the desktop window).
-->
<script lang="ts">
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { sortFilesIntoZones } from '$lib/visualizer/area-zones';
	import { describePracticeState } from '$lib/home/describe-practice';
	import AreaDesk from '$lib/components/visualizer/AreaDesk.svelte';

	let { snapshot }: { snapshot: RepoSnapshot | null } = $props();
</script>

<div class="flex min-w-0 flex-col justify-center gap-3 border-l bg-surface-sunken p-6">
	<span class="type-caption text-ink-muted uppercase">Where your practice repo is</span>
	{#if snapshot === null}
		<p class="type-sidenote m-0 text-ink-muted">
			Your practice repository shows here once its lesson has built it.
		</p>
	{:else}
		<AreaDesk {snapshot} />
		<p class="type-sidenote m-0 text-ink-muted">
			{describePracticeState(sortFilesIntoZones(snapshot))}
		</p>
	{/if}
</div>
