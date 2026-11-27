<!--
  SearchPanel.svelte
  The quick search panel that Ctrl K opens over any screen, like on modern docs sites: a
  search box, the top results of each group, and "See all results" for the full search page.
  It is a modal <dialog>: the page behind it is inert, Esc closes it, and keyboard focus goes
  back to where it was before the panel opened.

  Inputs: isOpen (show or hide the panel), onclose (called when the panel wants to close).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { courseSearchIndex } from '$lib/search/course-search';
	import { groupResults, searchItems } from '$lib/search/search-items';
	import SearchExplorer from './SearchExplorer.svelte';

	let { isOpen, onclose }: { isOpen: boolean; onclose: () => void } = $props();

	/** How many results of each kind the panel shows; the page shows them all. */
	const resultsPerGroup = 3;

	let query = $state('');
	let dialogElement: HTMLDialogElement | undefined = $state();
	let focusBeforeOpening: HTMLElement | null = null;

	const groups = $derived(groupResults(searchItems(courseSearchIndex, query), resultsPerGroup));
	const allResultsHref = $derived(`${resolve('/search')}?q=${encodeURIComponent(query)}`);

	// Opens or closes the native dialog when isOpen changes, and gives focus back on close.
	$effect(() => {
		if (dialogElement === undefined) {
			return;
		}
		if (isOpen && !dialogElement.open) {
			focusBeforeOpening = document.activeElement as HTMLElement | null;
			query = '';
			dialogElement.showModal();
		} else if (!isOpen && dialogElement.open) {
			dialogElement.close();
			focusBeforeOpening?.focus();
		}
	});

	/**
	 * Closes the panel when the dialog itself is cancelled (the browser's own Esc handling).
	 * @param event - the dialog's cancel event
	 */
	function handleCancel(event: Event): void {
		event.preventDefault();
		onclose();
	}

	/**
	 * Closes the panel when the student clicks the dimmed page around it.
	 * @param mouseEvent - a click anywhere in the dialog
	 */
	function handleBackdropClick(mouseEvent: MouseEvent): void {
		if (mouseEvent.target === dialogElement) {
			onclose();
		}
	}

	/**
	 * Opens the full search page with the same query.
	 * @param mouseEvent - the click on "See all results"
	 */
	function openAllResults(mouseEvent: MouseEvent): void {
		mouseEvent.preventDefault();
		onclose();
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- built from resolve() above
		void goto(allResultsHref);
	}
</script>

<dialog
	bind:this={dialogElement}
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	aria-label="Quick search"
	class="mx-auto mt-[12vh] w-[min(42rem,calc(100vw-2rem))] rounded-large border bg-canvas p-0 text-ink shadow-floating backdrop:bg-ink/30"
>
	<div class="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-5">
		{#if isOpen}
			<SearchExplorer
				bind:query
				{groups}
				idPrefix="panel"
				onescape={onclose}
				onopen={onclose}
				autofocus
			/>
		{/if}
		<div
			class="type-small flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-ink-muted"
		>
			<span>↑ ↓ move · ⏎ open · Esc close</span>
			<!-- eslint-disable svelte/no-navigation-without-resolve -- built from resolve() above -->
			<a href={allResultsHref} onclick={openAllResults}>See all results →</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
		</div>
	</div>
</dialog>
