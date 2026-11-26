<!--
  +page.svelte (course map, "/course-map")
  The whole course in one of two orders, picked with the Pro path / Book path switch (shared
  with home and remembered): Pro path modules, or Pro Git chapters and sections. Nothing is
  locked: every row opens its lesson. Built only from the path files and saved progress.
-->
<script lang="ts">
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { progress, saveChosenPath, type CoursePathId } from '$lib/stores/progress';
	import {
		buildBookChapters,
		buildProModules,
		countCourseLessons
	} from '$lib/course-map/course-map-data';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import ModuleBlock from '$lib/components/course-map/ModuleBlock.svelte';
	import ChapterBlock from '$lib/components/course-map/ChapterBlock.svelte';

	const pathOptions: SegmentedSwitchOption<CoursePathId>[] = [
		{ value: 'pro-path', label: 'Pro path' },
		{ value: 'book-path', label: 'Book path' }
	];

	/** The sentence under the title, for each path. */
	const pathIntroductions: Record<CoursePathId, string> = {
		'pro-path':
			'Lessons ordered by what you need at work: daily basics first, team work next, deep internals last. Jump to any lesson at any time.',
		'book-path':
			'The same lessons in Pro Git order, chapter by chapter. Every section points to the lesson that teaches it.'
	};

	const lessonCount = countCourseLessons();
	const isProPath = $derived($progress.chosenPathId === 'pro-path');

	/**
	 * Saves the path picked with the switch.
	 * @param pathId - "pro-path" or "book-path"
	 */
	function choosePath(pathId: CoursePathId): void {
		void saveChosenPath(pathId);
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Course map')}</title>
</svelte:head>

<div class="flex max-w-270 flex-col gap-7 px-12 pt-10 pb-12">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-2">
			<span class="type-caption text-ink-muted uppercase">
				{lessonCount}
				{lessonCount === 1 ? 'lesson' : 'lessons'} · nothing is locked
			</span>
			<h1 class="type-h1 m-0">Course map</h1>
		</div>
		<SegmentedSwitch
			groupLabel="Order"
			options={pathOptions}
			value={$progress.chosenPathId}
			onchange={choosePath}
		/>
	</div>

	<p class="type-lesson m-0 max-w-[64ch]">{pathIntroductions[$progress.chosenPathId]}</p>

	<div class="flex flex-col gap-5">
		{#if isProPath}
			{#each buildProModules($progress) as group (group.id)}
				<ModuleBlock {group} />
			{/each}
		{:else}
			{#each buildBookChapters($progress) as group (group.number)}
				<ChapterBlock {group} />
			{/each}
		{/if}
		<p
			class="type-small m-0 rounded-medium border border-dashed border-border-strong bg-surface px-5 py-4 text-ink-muted"
		>
			More lessons arrive as the course grows: the course plan has 62.
		</p>
	</div>
</div>
