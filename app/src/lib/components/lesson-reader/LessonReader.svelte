<!--
  LessonReader.svelte
  The lesson column: header, layer tabs, the chosen layer's text, the recap card, anything the
  page adds after the text (mission, quiz), and the Previous / Next links.

  Inputs:  lesson (the loaded lesson), place (its number and neighbours in the path, or null),
           afterText (optional: content shown under the recap, like the mission panel).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Lesson, LessonSections } from '$lib/types/lesson';
	import { formatLessonNumber, type LessonPlace } from '$lib/content/lesson-navigation';
	import { renderInlineMarkdown } from '$lib/content/render-markdown';
	import LayerTabs from './LayerTabs.svelte';
	import LessonHeader from './LessonHeader.svelte';
	import LessonMarkdown from './LessonMarkdown.svelte';
	import LessonPager from './LessonPager.svelte';
	import RecapCard from './RecapCard.svelte';

	let {
		lesson,
		place,
		afterText
	}: { lesson: Lesson; place: LessonPlace | null; afterText?: Snippet } = $props();

	/** The three reading layers; the recap is always shown, so it is not a tab. */
	type LayerId = Exclude<keyof LessonSections, 'recap'>;
	const layers: readonly { id: LayerId; label: string }[] = [
		{ id: 'useIt', label: 'Use it' },
		{ id: 'howItWorks', label: 'How it works' },
		{ id: 'pro', label: 'Pro' }
	];
	const panelIdPrefix = 'lesson-layer';

	let activeLayerId: LayerId = $state('useIt');

	/**
	 * Shows another layer.
	 * @param layerId - the layer the student picked
	 */
	function showLayer(layerId: LayerId): void {
		activeLayerId = layerId;
	}

	const lessonNumber = $derived(place === null ? null : formatLessonNumber(place.lessonNumber));
	const moduleTitle = $derived(place?.moduleTitle ?? lesson.module);
</script>

<article class="flex max-w-160 min-w-0 flex-[1_1_35rem] flex-col border-r bg-surface">
	<div class="flex flex-1 flex-col gap-4.5 overflow-y-auto px-9 pt-7 pb-8">
		<LessonHeader
			title={lesson.title}
			{lessonNumber}
			{moduleTitle}
			bookSection={lesson.bookSection}
			bookUrl={lesson.bookUrl}
		/>

		<LayerTabs {layers} {activeLayerId} {panelIdPrefix} onchange={showLayer} />

		<div
			role="tabpanel"
			id={`${panelIdPrefix}-${activeLayerId}`}
			aria-labelledby={`${panelIdPrefix}-tab-${activeLayerId}`}
			class="flex flex-col gap-4"
		>
			{#if activeLayerId === 'useIt'}
				<p class="lesson-lede type-lede m-0 max-w-[64ch]">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
					{@html renderInlineMarkdown(lesson.lede)}
				</p>
			{/if}
			<LessonMarkdown markdown={lesson.sections[activeLayerId]} />
		</div>

		<RecapCard markdown={lesson.sections.recap} />

		{@render afterText?.()}
	</div>

	<LessonPager
		previousLesson={place?.previousLesson ?? null}
		nextLesson={place?.nextLesson ?? null}
	/>
</article>
