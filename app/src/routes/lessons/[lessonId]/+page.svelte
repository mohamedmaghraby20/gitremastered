<!--
  +page.svelte (one lesson, "/lessons/<lessonId>")
  The lesson screen: the lesson column on the left and the practice column (visualizer and
  terminal) on the right. An unknown lesson ID shows "Lesson not found" instead.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import LessonNotFound from '$lib/components/lesson-reader/LessonNotFound.svelte';
	import LessonReader from '$lib/components/lesson-reader/LessonReader.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{buildPageTitle(data.lesson?.title ?? 'Lesson not found')}</title>
</svelte:head>

{#if data.lesson === null}
	<LessonNotFound lessonId={data.lessonId} />
{:else}
	<!-- Fills the window under the 48px top bar (h-12), so each column scrolls on its own. -->
	<div class="flex h-[calc(100dvh-(--spacing(12)))] flex-wrap">
		{#key data.lesson.id}
			<LessonReader lesson={data.lesson} place={data.place} />
		{/key}
		<section
			aria-label="Practice"
			class="flex min-w-0 flex-[999_1_26rem] flex-col gap-3 p-3"
		></section>
	</div>
{/if}
