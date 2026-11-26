<!--
  ContinueCard.svelte
  "Pick up where you left off": the last opened lesson (number, module, source, title, lede,
  layer marks) with Continue lesson as the screen's one primary button, and the practice
  repository's three areas beside it. Enter anywhere on the page also continues (the ⏎ key
  on the button says so); the page handles that key.

  Inputs: card (the lesson's list card), furthestLayerId (deepest layer opened),
          snapshot (the practice repository, or null).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LessonCard } from '$lib/content/course-content';
	import type { LessonLayerId } from '$lib/types/lesson';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { renderInlineMarkdown } from '$lib/content/render-markdown';
	import { buttonVariants } from '$lib/components/ui/button';
	import LayerMarks from './LayerMarks.svelte';
	import PracticePreview from './PracticePreview.svelte';

	let {
		card,
		furthestLayerId,
		snapshot
	}: {
		card: LessonCard;
		furthestLayerId: LessonLayerId | undefined;
		snapshot: RepoSnapshot | null;
	} = $props();
</script>

<section
	aria-label="Continue learning"
	class="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] overflow-hidden rounded-medium border bg-surface"
>
	<div class="flex min-w-0 flex-col gap-3.5 px-8 py-7">
		<div class="type-caption flex flex-wrap items-center gap-2 text-ink-muted uppercase">
			{#if card.numberLabel !== null}
				<span class="type-label-mono rounded-small border border-border-strong px-1.5 text-ink">
					{card.numberLabel}
				</span>
			{/if}
			{card.moduleTitle} · {card.sourceLabel}
		</div>
		<h2 class="type-h2 m-0">{card.title}</h2>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- the lede comes from our own content files -->
		<p class="type-lede m-0 max-w-[52ch]">{@html renderInlineMarkdown(card.lede)}</p>
		<LayerMarks {furthestLayerId} />
		<div class="mt-1.5 flex flex-wrap gap-3">
			<a
				href={resolve('/lessons/[lessonId]', { lessonId: card.id })}
				class={buttonVariants({ variant: 'primary' })}
			>
				Continue lesson
				<kbd class="type-label-mono rounded-small border border-current px-1 opacity-75">⏎</kbd>
			</a>
			<a href={resolve('/course-map')} class={buttonVariants({ variant: 'secondary' })}>
				Open course map
			</a>
		</div>
	</div>
	<PracticePreview {snapshot} />
</section>
