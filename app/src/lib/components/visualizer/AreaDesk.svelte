<!--
  AreaDesk.svelte
  The visualizer's desk, kept compact: the three zones side by side (working folder, staging
  area, repository), each with a one-line header, and the commands that move files between
  them as small keycaps.

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
	import DeskZone from './DeskZone.svelte';
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

	/**
	 * Words for a number of files, for a zone's header.
	 * @param fileCount - how many files
	 * @returns e.g. "1 file" or "3 files"
	 */
	function countFiles(fileCount: number): string {
		return fileCount === 1 ? '1 file' : `${fileCount} files`;
	}

	$effect(() => {
		const currentZones = zones;
		justMovedKeys = findNewSheets(previousZones, currentZones);
		previousZones = currentZones;
	});
</script>

<div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-start">
	<DeskZone
		name="Working folder"
		hint="What you're editing"
		tone="working"
		countLabel={countFiles(zones.working.length)}
	>
		{#each zones.working as sheet (sheet.path)}
			<FileSheet
				{...sheet}
				zone="working"
				isJustMoved={justMovedKeys.has(sheetKey('working', sheet.path))}
			/>
		{/each}
	</DeskZone>

	<ZoneCommand command="git add" />

	<DeskZone
		name="Staging area"
		hint="Picked for the next commit"
		tone="staging"
		countLabel={countFiles(zones.staging.length)}
	>
		{#each zones.staging as sheet (sheet.path)}
			<FileSheet
				{...sheet}
				zone="staging"
				isJustMoved={justMovedKeys.has(sheetKey('staging', sheet.path))}
			/>
		{/each}
	</DeskZone>

	<ZoneCommand command="git commit" />

	<DeskZone
		name="Repository"
		hint="Every commit you have saved"
		tone="repository"
		countLabel={zones.repository.commitCount === 1
			? '1 commit'
			: `${zones.repository.commitCount} commits`}
	>
		{#each zones.repository.latestCommits as commitCard, index (commitCard.shortId)}
			<li
				class={[
					'type-label-mono flex justify-between gap-1.5 rounded-small border border-on-git-repository px-1.5 py-0.5',
					index > 0 && 'opacity-60'
				]}
			>
				<span>{commitCard.shortId}</span>
				<span class="truncate font-sans">{commitCard.message}</span>
			</li>
		{/each}
	</DeskZone>
</div>
