<!--
  AreaDesk.svelte
  The visualizer's desk: the three zones side by side (working folder, staging area,
  repository) with the commands that move files between them as keycaps.

  Input: snapshot (the repo state, or null while it loads).
-->
<script lang="ts">
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import {
		findNewSheets,
		sheetKey,
		sortFilesIntoZones,
		type DeskZones
	} from '$lib/visualizer/area-zones';
	import FileSheet from './FileSheet.svelte';
	import ZoneCommand from './ZoneCommand.svelte';

	let { snapshot }: { snapshot: RepoSnapshot | null } = $props();

	const emptyZones: DeskZones = {
		working: [],
		staging: [],
		repository: { commitCount: 0, latestCommits: [] }
	};
	const zones = $derived(snapshot === null ? emptyZones : sortFilesIntoZones(snapshot));

	// Not reactive on purpose: it only remembers the last zones to spot newly arrived sheets.
	let previousZones: DeskZones | null = null;
	let justMovedKeys: Set<string> = $state(new Set());

	$effect(() => {
		const currentZones = zones;
		justMovedKeys = findNewSheets(previousZones, currentZones);
		previousZones = currentZones;
	});
</script>

<div class="grid grid-cols-[minmax(0,1fr)_5rem_minmax(0,1fr)_5.5rem_minmax(0,1fr)]">
	<section
		aria-label="Working folder"
		class="flex min-h-28 min-w-0 flex-col gap-1.5 rounded-medium border border-dashed border-git-working bg-surface p-2.5"
	>
		<h3 class="type-label-mono m-0 font-bold">Working folder</h3>
		<p class="type-sidenote m-0 text-ink-muted">what you're editing</p>
		<ul class="m-0 flex list-none flex-col gap-1.5 p-0">
			{#each zones.working as sheet (sheet.path)}
				<FileSheet
					{...sheet}
					zone="working"
					isJustMoved={justMovedKeys.has(sheetKey('working', sheet.path))}
				/>
			{/each}
		</ul>
	</section>

	<ZoneCommand command="git add" />

	<section
		aria-label="Staging area"
		class="flex min-h-28 min-w-0 flex-col gap-1.5 rounded-medium border border-git-staging-edge bg-git-staging-wash p-2.5"
	>
		<h3 class="type-label-mono m-0 font-bold text-git-staging-edge">Staging area</h3>
		<p class="type-sidenote m-0 text-git-staging-edge">picked for the next commit</p>
		<ul class="m-0 flex list-none flex-col gap-1.5 p-0">
			{#each zones.staging as sheet (sheet.path)}
				<FileSheet
					{...sheet}
					zone="staging"
					isJustMoved={justMovedKeys.has(sheetKey('staging', sheet.path))}
				/>
			{/each}
		</ul>
	</section>

	<ZoneCommand command="git commit" />

	<section
		aria-label="Repository"
		class="flex min-h-28 min-w-0 flex-col gap-1.5 rounded-medium bg-git-repository p-2.5 text-on-git-repository"
	>
		<h3 class="type-label-mono m-0 font-bold">Repository</h3>
		<p class="type-sidenote m-0 opacity-80">
			{zones.repository.commitCount === 1 ? '1 commit' : `${zones.repository.commitCount} commits`}
		</p>
		<ul class="m-0 flex list-none flex-col gap-1.5 p-0">
			{#each zones.repository.latestCommits as commitCard, index (commitCard.shortId)}
				<li
					class={[
						'type-label-mono flex justify-between gap-1.5 rounded-small border border-on-git-repository px-2 py-1',
						index > 0 && 'opacity-60'
					]}
				>
					<span>{commitCard.shortId}</span>
					<span class="truncate font-sans">{commitCard.message}</span>
				</li>
			{/each}
		</ul>
	</section>
</div>
