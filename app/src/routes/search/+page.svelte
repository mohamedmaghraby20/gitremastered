<!--
  +page.svelte (search, "/search?q=…")
  The full search page: the search box, filter chips with counts (All, Lessons, Commands,
  Terms, Pro Git), and every result grouped. The query lives in the address (?q=), so "See all
  results" in the Ctrl K panel opens this page with the same words. Esc clears the box.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { courseSearchIndex } from '$lib/search/course-search';
	import type { SearchKind } from '$lib/search/search-index';
	import { groupResults, resultGroupOrder, searchItems } from '$lib/search/search-items';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import SearchExplorer from '$lib/components/search/SearchExplorer.svelte';

	type FilterChoice = SearchKind | 'all';

	let query = $state(page.url.searchParams.get('q') ?? '');
	let chosenFilter: FilterChoice = $state('all');

	const results = $derived(searchItems(courseSearchIndex, query));
	const shownGroups = $derived(
		groupResults(
			chosenFilter === 'all' ? results : results.filter((item) => item.kind === chosenFilter)
		)
	);
	const filterOptions: SegmentedSwitchOption<FilterChoice>[] = $derived([
		{ value: 'all', label: `All ${results.length}` },
		...resultGroupOrder.map(({ kind, heading }) => ({
			value: kind,
			label: `${heading} ${results.filter((item) => item.kind === kind).length}`
		}))
	]);

	// Keeps the address in step with the box, so going back or reloading keeps the query.
	$effect(() => {
		const searchAddress = `${resolve('/search')}?q=${encodeURIComponent(query)}`;
		if (page.url.searchParams.get('q') !== query) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- built from resolve()
			void goto(searchAddress, { replaceState: true, keepFocus: true, noScroll: true });
		}
	});

	/** Clears the box (Esc on the search page). */
	function clearQuery(): void {
		query = '';
	}

	/**
	 * Shows only one kind of result, or all of them.
	 * @param filter - "all", "lesson", "command", "term" or "book"
	 */
	function chooseFilter(filter: FilterChoice): void {
		chosenFilter = filter;
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Search')}</title>
</svelte:head>

<div class="flex max-w-230 flex-col gap-6 px-12 pt-10 pb-12">
	<h1 class="type-h1 m-0">Search</h1>
	<SearchExplorer bind:query groups={shownGroups} idPrefix="page" onescape={clearQuery} autofocus>
		{#snippet filters()}
			{#if query.trim() !== ''}
				<SegmentedSwitch
					groupLabel="Show"
					options={filterOptions}
					value={chosenFilter}
					onchange={chooseFilter}
				/>
			{/if}
		{/snippet}
	</SearchExplorer>
	{#if query.trim() !== '' && results.length === 0}
		<p class="m-0 text-ink-muted">
			Nothing matches “{query}”. Try a command like <code>git add</code>, or a word like “staging”.
		</p>
	{/if}
	<p class="type-small m-0 border-t pt-3.5 text-ink-muted">↑ ↓ move · ⏎ open · Esc clear</p>
</div>
