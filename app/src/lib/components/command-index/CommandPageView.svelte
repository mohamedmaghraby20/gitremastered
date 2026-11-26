<!--
  CommandPageView.svelte
  One command's page in the command index: group and source, the command as the title, its
  summary, the usage lines, the explanation (with the usual lesson blocks), and "Learn it".

  Inputs: commandPage (the page's content), lessonCards (the lessons that teach it).
-->
<script lang="ts">
	import type { CommandPage } from '$lib/types/reference';
	import type { LessonCard } from '$lib/content/course-content';
	import { findSourceLabel } from '$lib/content/lesson-facts';
	import LessonBlocks from '$lib/components/lesson-reader/LessonBlocks.svelte';
	import LearnItLinks from './LearnItLinks.svelte';

	let { commandPage, lessonCards }: { commandPage: CommandPage; lessonCards: LessonCard[] } =
		$props();

	const sourceLabel = $derived(findSourceLabel(commandPage));
</script>

<article class="flex max-w-205 min-w-0 flex-1 flex-col gap-5.5 self-start px-12 py-9">
	<div class="flex flex-col gap-2">
		<span class="type-caption text-ink-muted uppercase">{commandPage.group} · {sourceLabel}</span>
		<h1 class="type-h1 m-0">{commandPage.command}</h1>
		<p class="type-lede m-0">{commandPage.summary}</p>
	</div>

	<section aria-label="Usage" class="overflow-hidden rounded-medium border bg-surface">
		<h2 class="type-caption m-0 border-b bg-surface-sunken px-3.5 py-2 text-ink-muted uppercase">
			Usage
		</h2>
		<ul class="m-0 flex list-none flex-col gap-1 px-3.5 py-3">
			{#each commandPage.usage as usageLine (usageLine)}
				<li class="type-code">{usageLine}</li>
			{/each}
		</ul>
	</section>

	<LessonBlocks markdown={commandPage.body} />

	<section aria-labelledby="learn-it-heading" class="flex flex-col gap-2.5">
		<h2 id="learn-it-heading" class="type-h3 m-0">Learn it</h2>
		<LearnItLinks {lessonCards} bookUrl={commandPage.bookUrl} bookLabel={sourceLabel} />
	</section>
</article>
