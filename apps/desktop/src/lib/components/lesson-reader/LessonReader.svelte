<!--
  LessonReader.svelte
  The lesson column: header, layer tabs, the chosen layer's text, the recap card, anything the
  page adds after the text (mission, quiz), and the Previous / Next links.

  Inputs:  lesson (the loaded lesson), place (its number and neighbours in the path, or null),
           afterText (optional: content shown under the recap on the "Must know" tab only,
           like the mission and the quiz), onLayerChange (optional: called with the layer the
           student switches to, so it can be saved), widthShare (optional: the column's share
           of the screen in percent, set by dragging the resize handle; null = the default).
  A lesson opened through a link in another lesson shows "← Back to …" at the top (BackBar),
  which returns to that lesson's layer and scroll position.
-->
<script lang="ts">
	import { tick, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { provideLessonPlace } from '$lib/navigation/lesson-place-context';
	import {
		findReturnPoint,
		forgetReturnPoint,
		startGoingBack,
		takePlaceToRestore
	} from '$lib/navigation/return-point.svelte';
	import BackBar from './BackBar.svelte';
	import type { Lesson, LessonLayerId } from '@gitremastered/course-engine/types/lesson';
	import {
		formatLessonNumber,
		type LessonPlace
	} from '@gitremastered/course-engine/content/lesson-navigation';
	import { renderInlineMarkdown } from '@gitremastered/course-engine/content/render-markdown';
	import LayerTabs from './LayerTabs.svelte';
	import LessonHeader from './LessonHeader.svelte';
	import LessonBlocks from './LessonBlocks.svelte';
	import LessonPager from './LessonPager.svelte';
	import RecapCard from './RecapCard.svelte';

	let {
		lesson,
		place,
		afterText,
		onLayerChange = () => {},
		widthShare = null
	}: {
		lesson: Lesson;
		place: LessonPlace | null;
		afterText?: Snippet;
		onLayerChange?: (layerId: LessonLayerId) => void;
		widthShare?: number | null;
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

	let scrollArea: HTMLDivElement | undefined = $state();

	// Links in the text ask where the student is, to remember the way back.
	provideLessonPlace(() => ({
		lessonId: lesson.id,
		title: lesson.title,
		layerId: activeLayerId,
		scrollTop: scrollArea?.scrollTop ?? 0
	}));

	/** The way back, when a link in another lesson opened this one. */
	const returnPoint = $derived(findReturnPoint(lesson.id));

	// Coming back through "← Back to": open the same layer and scroll to the same place.
	$effect(() => {
		const placeToRestore = takePlaceToRestore(lesson.id);
		if (placeToRestore === null) {
			return;
		}
		showLayer(placeToRestore.layerId);
		void tick().then(() => {
			if (scrollArea !== undefined) {
				scrollArea.scrollTop = placeToRestore.scrollTop;
			}
		});
	});

	/** Goes back to the lesson the link was followed from. */
	function goBack(): void {
		const fromLessonId = startGoingBack();
		if (fromLessonId !== null) {
			void goto(resolve('/lessons/[lessonId]', { lessonId: fromLessonId }));
		}
	}

	const lessonNumber = $derived(place === null ? null : formatLessonNumber(place.lessonNumber));
	const moduleTitle = $derived(place?.moduleTitle ?? lesson.module);
</script>

<!-- Default: a flexible column up to 640px. After a drag: exactly the dragged share. -->
<article
	style:--lesson-share={widthShare === null ? undefined : `${widthShare}%`}
	class={[
		'flex h-full min-w-80 flex-col border-r bg-surface',
		widthShare === null
			? 'max-w-160 flex-[1_1_35rem] narrow:flex-[1_1_25rem]'
			: 'flex-[0_0_var(--lesson-share)]'
	]}
>
	<!-- relative: screen-reader-only text (absolutely positioned) stays inside this scroll area
	     instead of stretching the whole page. -->
	<div
		bind:this={scrollArea}
		class="relative flex min-h-0 flex-1 flex-col gap-4.5 overflow-y-auto px-9 pt-7 pb-8"
	>
		{#if returnPoint !== null}
			<BackBar fromTitle={returnPoint.fromTitle} onback={goBack} ondismiss={forgetReturnPoint} />
		{/if}
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
