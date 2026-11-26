<!--
  LessonReader.svelte
  The lesson column: header, layer tabs, the chosen layer's text, the recap card, anything the
  page adds after the text (mission, quiz), and the Previous / Next links.

  Inputs:  lesson (the loaded lesson), place (its number and neighbours in the path, or null),
           afterText (optional: content shown under the recap on the "Must know" tab only,
           like the mission and the quiz), onLayerChange (optional: called with the layer the
           student switches to, so it can be saved).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Lesson, LessonLayerId } from '$lib/types/lesson';
	import { formatLessonNumber, type LessonPlace } from '$lib/content/lesson-navigation';
	import { renderInlineMarkdown } from '$lib/content/render-markdown';
	import LayerTabs from './LayerTabs.svelte';
	import LessonHeader from './LessonHeader.svelte';
	import LessonBlocks from './LessonBlocks.svelte';
	import LessonPager from './LessonPager.svelte';
	import RecapCard from './RecapCard.svelte';

	let {
		lesson,
		place,
		afterText,
		onLayerChange = () => {}
	}: {
		lesson: Lesson;
		place: LessonPlace | null;
		afterText?: Snippet;
		onLayerChange?: (layerId: LessonLayerId) => void;
	} = $props();

	/** The three reading layers; the recap is always shown, so it is not a tab. */
	const layers: readonly { id: LessonLayerId; label: string }[] = [
		{ id: 'mustKnow', label: 'Must know' },
		{ id: 'underTheHood', label: 'Under the hood' },
		{ id: 'advanced', label: 'Advanced' }
	];
	const panelIdPrefix = 'lesson-layer';

	let activeLayerId: LessonLayerId = $state('mustKnow');

	/**
	 * Shows another layer.
	 * @param layerId - the layer the student picked
	 */
	function showLayer(layerId: LessonLayerId): void {
		activeLayerId = layerId;
		onLayerChange(layerId);
	}

	const lessonNumber = $derived(place === null ? null : formatLessonNumber(place.lessonNumber));
	const moduleTitle = $derived(place?.moduleTitle ?? lesson.module);
</script>

<article class="flex h-full max-w-160 min-w-0 flex-[1_1_35rem] flex-col border-r bg-surface">
	<!-- relative: screen-reader-only text (absolutely positioned) stays inside this scroll area
	     instead of stretching the whole page. -->
	<div class="relative flex min-h-0 flex-1 flex-col gap-4.5 overflow-y-auto px-9 pt-7 pb-8">
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
			{#if activeLayerId === 'mustKnow'}
				<p class="lesson-lede type-lede m-0 max-w-[64ch]">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
					{@html renderInlineMarkdown(lesson.lede)}
				</p>
			{/if}
			<LessonBlocks markdown={lesson.sections[activeLayerId]} />
		</div>

		<RecapCard markdown={lesson.sections.recap} />

		<!-- The mission and quiz practise "Must know". On the other tabs they are hidden, not
		     removed, so revealed hints and checked answers survive a tab switch. -->
		<div class="flex flex-col gap-12 pt-6" hidden={activeLayerId !== 'mustKnow'}>
			{@render afterText?.()}
		</div>
	</div>

	<LessonPager
		previousLesson={place?.previousLesson ?? null}
		nextLesson={place?.nextLesson ?? null}
	/>
</article>
