<!--
  HistoryPanel.svelte
  The history map in the practice column, with an "Expand" button that opens the map large
  over the lesson for long histories. The large map is a modal dialog: Esc or "Close" shuts
  it and focus goes back to the Expand button. The lesson screen stays underneath, so the
  terminal's shell keeps running.

  Input: snapshot (the repo state, or null while it loads).
-->
<script lang="ts">
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { Button } from '$lib/components/ui/button';
	import HistoryMap from './HistoryMap.svelte';

	let { snapshot }: { snapshot: RepoSnapshot | null } = $props();

	let dialogElement: HTMLDialogElement | undefined = $state();
	let expandButton: HTMLButtonElement | undefined = $state();
	let isExpanded = $state(false);

	/** Opens the large map. */
	function expandMap(): void {
		isExpanded = true;
		dialogElement?.showModal();
	}

	/** Closes the large map and gives focus back to the Expand button. */
	function closeMap(): void {
		dialogElement?.close();
	}

	/** Runs when the dialog closes in any way (Esc, Close button): tidy up and restore focus. */
	function handleClosed(): void {
		isExpanded = false;
		expandButton?.focus();
	}
</script>

<HistoryMap {snapshot}>
	{#snippet headerAside()}
		<button
			bind:this={expandButton}
			type="button"
			onclick={expandMap}
			aria-haspopup="dialog"
			class="type-caption cursor-pointer rounded-small border border-border bg-surface px-1.5 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary"
		>
			⤢ Expand
		</button>
	{/snippet}
</HistoryMap>

<dialog
	bind:this={dialogElement}
	onclose={handleClosed}
	aria-label="History, large"
	class="m-auto h-[85vh] w-[min(80rem,calc(100vw-4rem))] rounded-large border bg-surface-sunken p-0 text-ink shadow-floating backdrop:bg-ink/30"
>
	{#if isExpanded}
		<div class="flex h-full flex-col">
			<HistoryMap {snapshot} headingLevel={2}>
				{#snippet headerAside()}
					<Button variant="secondary" onclick={closeMap} shortcut="Esc">Close</Button>
				{/snippet}
			</HistoryMap>
		</div>
	{/if}
</dialog>
