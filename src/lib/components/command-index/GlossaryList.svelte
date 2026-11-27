<!--
  GlossaryList.svelte
  The command index's Terms page: every glossary term with its plain meaning and the lessons
  that teach it. Each term has an id, so "/commands/terms#staging-area" scrolls to it, and the
  term the address points at gets the highlighter wash (CSS :target).

  Input: terms (each term with its lesson cards).
-->
<script lang="ts">
	import type { GlossaryTerm } from '@gitremastered/course-engine/types/reference';
	import type { LessonCard } from '$lib/content/course-content';
	import { renderInlineMarkdown } from '@gitremastered/course-engine/content/render-markdown';
	import LearnItLinks from './LearnItLinks.svelte';

	let { terms }: { terms: (GlossaryTerm & { lessonCards: LessonCard[] })[] } = $props();
</script>

<article class="flex max-w-205 min-w-0 flex-1 flex-col gap-6 self-start px-12 py-9">
	<div class="flex flex-col gap-2">
		<span class="type-caption text-ink-muted uppercase">{terms.length} terms</span>
		<h1 class="type-h1 m-0">Terms</h1>
		<p class="type-lede m-0">The words Git and this course use, each in a sentence or two.</p>
	</div>

	<dl class="m-0 flex flex-col gap-3">
		{#each terms as term (term.id)}
			<div
				id={term.id}
				class="flex scroll-mt-6 flex-col gap-2 rounded-medium border bg-surface px-5 py-4 target:bg-git-staging-wash target:shadow-[inset_3px_0_0_var(--primary)]"
			>
				<dt class="type-h3 m-0">{term.term}</dt>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- the meaning comes from our own content files -->
				<dd class="type-lesson m-0">{@html renderInlineMarkdown(term.meaning)}</dd>
				{#if term.lessonCards.length > 0}
					<dd class="m-0">
						<LearnItLinks lessonCards={term.lessonCards} bookUrl={null} bookLabel="" />
					</dd>
				{/if}
			</div>
		{/each}
	</dl>
</article>
