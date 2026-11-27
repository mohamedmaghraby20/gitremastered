<!--
  +layout.svelte (command index, "/commands/…")
  The command index's frame: the list of commands and terms on the left, and the page on the
  right (one command, the terms, or the welcome text). Each side scrolls on its own.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { listGlossaryTerms } from '$lib/content/course-content';
	import { listCommandGroups } from '$lib/command-index/command-index-data';
	import CommandIndexNav from '$lib/components/command-index/CommandIndexNav.svelte';

	let { children }: { children: Snippet } = $props();

	const commandGroups = listCommandGroups();
	const glossaryTerms = listGlossaryTerms();
</script>

<div class="flex h-full min-h-0">
	<CommandIndexNav groups={commandGroups} terms={glossaryTerms} currentPath={page.url.pathname} />
	<div class="flex min-w-0 flex-1 overflow-y-auto">
		{@render children()}
	</div>
</div>
