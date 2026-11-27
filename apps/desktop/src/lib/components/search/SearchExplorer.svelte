<!--
  SearchExplorer.svelte
  The search box and its grouped results, shared by the Ctrl K panel and the search page.
  It follows the combobox pattern: focus stays in the box, ↑ ↓ move the highlight through the
  results (screen readers follow it through aria-activedescendant), ⏎ opens the highlighted
  result, and Esc is handed to the parent (the panel closes, the page clears the box).

  Inputs:  query (bindable: the text in the box), groups (the results to show, grouped),
           idPrefix (keeps element IDs unique when panel and page exist at once),
           onescape (called when Esc is pressed), onopen (called just before a result opens),
           autofocus (focus the box when shown), filters (optional: shown between the box and
           the results, like the search page's filter chips).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import type { SearchItem } from '$lib/search/search-index';
	import { moveHighlight, type ResultGroup } from '$lib/search/search-items';

	let {
		query = $bindable(),
		groups,
		idPrefix,
		onescape,
		onopen = () => {},
		autofocus = false,
		filters
	}: {
		query: string;
		groups: ResultGroup[];
		idPrefix: string;
		onescape: () => void;
		onopen?: () => void;
		autofocus?: boolean;
		filters?: Snippet;
	} = $props();

	const shownItems = $derived(groups.flatMap((group) => group.items));
	let highlightedIndex = $state(-1);
	let searchInput: HTMLInputElement | undefined = $state();

	// A new query or new results start with nothing highlighted.
	$effect(() => {
		void shownItems;
		highlightedIndex = -1;
	});

	// Focus the box when it appears (the Ctrl K panel) and again after a page navigation,
	// because SvelteKit moves focus back to the page's start when a navigation finishes.
	$effect(() => {
		if (autofocus) {
			searchInput?.focus();
		}
	});
	afterNavigate(() => {
		if (autofocus) {
			searchInput?.focus();
		}
	});

	/**
	 * Builds the element ID of one result row.
	 * @param item - the result
	 * @returns a unique ID, e.g. "panel-result-command-git-add"
	 */
	function resultElementId(item: SearchItem): string {
		return `${idPrefix}-result-${item.kind}-${item.id.replace(/[^a-z0-9-]/gi, '-')}`;
	}

	/**
	 * Opens a result in the app.
	 * @param item - the result to open
	 */
	function openResult(item: SearchItem): void {
		onopen();
		// The href is an app path built by the search index (e.g. "/lessons/three-areas").
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(item.href);
	}

	/**
	 * Handles ↑ ↓ ⏎ Esc in the search box.
	 * @param keyEvent - the key press
	 */
	function handleSearchKey(keyEvent: KeyboardEvent): void {
		if (keyEvent.key === 'Escape') {
			keyEvent.preventDefault();
			onescape();
			return;
		}
		if (keyEvent.key === 'Enter') {
			const item = shownItems[highlightedIndex] ?? shownItems[0];
			if (item !== undefined) {
				keyEvent.preventDefault();
				openResult(item);
			}
			return;
		}
		const nextIndex = moveHighlight(highlightedIndex, keyEvent.key, shownItems.length);
		if (nextIndex !== null) {
			keyEvent.preventDefault();
			highlightedIndex = nextIndex;
			document
				.getElementById(resultElementId(shownItems[nextIndex]))
				?.scrollIntoView({ block: 'nearest' });
		}
	}

	/**
	 * Opens a clicked result through goto, like ⏎ does.
	 * @param mouseEvent - the click
	 * @param item - the clicked result
	 */
	function handleResultClick(mouseEvent: MouseEvent, item: SearchItem): void {
		mouseEvent.preventDefault();
		openResult(item);
	}
</script>

<div class="flex flex-col gap-5">
	<div
		class="flex items-center gap-3 rounded-medium border border-b-3 border-border-strong bg-surface px-4 py-3"
	>
		<span aria-hidden="true" class="text-ink-muted">⌕</span>
		<input
			bind:this={searchInput}
			bind:value={query}
			onkeydown={handleSearchKey}
			type="search"
			role="combobox"
			aria-label="Search lessons, commands, terms and the book"
			aria-expanded={shownItems.length > 0}
			aria-controls={`${idPrefix}-results`}
			aria-autocomplete="list"
			aria-activedescendant={highlightedIndex >= 0 && shownItems[highlightedIndex]
				? resultElementId(shownItems[highlightedIndex])
				: undefined}
			placeholder="Search lessons, commands, terms"
			class="type-code min-w-0 flex-1 border-0 bg-transparent text-ink outline-none"
		/>
		<kbd
			class="type-label-mono rounded-small border border-b-2 border-border-strong px-1.5 text-ink-muted"
		>
			Esc
		</kbd>
	</div>

	{@render filters?.()}

	<div id={`${idPrefix}-results`} role="listbox" aria-label="Results" class="flex flex-col gap-4">
		{#each groups as group (group.kind)}
			<div role="group" aria-label={group.heading} class="flex flex-col gap-1.5">
				<span class="type-caption text-ink-muted uppercase">{group.heading}</span>
				{#each group.items as item (item.kind + item.id)}
					{@const isHighlighted = shownItems[highlightedIndex] === item}
					<!-- The href is an app path from the search index; clicks go through goto(). -->
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						id={resultElementId(item)}
						href={item.href}
						role="option"
						aria-selected={isHighlighted}
						tabindex="-1"
						onclick={(mouseEvent) => handleResultClick(mouseEvent, item)}
						class={[
							'grid grid-cols-[8.5rem_minmax(0,1fr)] items-baseline gap-4 rounded-medium border px-4 py-3 text-ink no-underline',
							isHighlighted
								? 'bg-git-staging-wash shadow-[inset_3px_0_0_var(--primary)]'
								: 'bg-surface hover:bg-surface-sunken'
						]}
					>
						<span class="type-label-mono truncate text-ink-muted">{item.tag}</span>
						<span class="flex min-w-0 flex-col gap-0.5">
							<span class="type-body font-semibold">{item.title}</span>
							<span class="type-sidenote truncate text-ink-muted">{item.snippet}</span>
						</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				{/each}
			</div>
		{/each}
	</div>
</div>
