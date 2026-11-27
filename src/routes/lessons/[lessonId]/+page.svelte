<!--
  +page.svelte (one lesson, "/lessons/<lessonId>")
  Shows the lesson screen, or "Lesson not found" for an unknown lesson ID.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import LessonNotFound from '$lib/components/lesson-reader/LessonNotFound.svelte';
	import LessonScreen from '$lib/components/lesson-screen/LessonScreen.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{buildPageTitle(data.lesson?.title ?? 'Lesson not found')}</title>
</svelte:head>

{#if data.lesson === null}
	<LessonNotFound lessonId={data.lessonId} />
{:else}
	{#key data.lesson.id}
		<LessonScreen lesson={data.lesson} place={data.place} />
	{/key}
{/if}
