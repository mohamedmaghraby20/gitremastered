<!--
  +page.svelte (one lesson, "/lessons/<lessonId>")
  The lesson screen: the lesson column on the left and the practice column (visualizer and
  terminal) on the right. An unknown lesson ID shows "Lesson not found" instead.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { isTauri } from '@tauri-apps/api/core';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { createPracticeRepo } from '$lib/tauri/commands';
	import LessonNotFound from '$lib/components/lesson-reader/LessonNotFound.svelte';
	import LessonReader from '$lib/components/lesson-reader/LessonReader.svelte';
	import PracticeTerminal from '$lib/components/terminal-view/PracticeTerminal.svelte';

	let { data }: PageProps = $props();

	let practiceFolderPath: string | null = $state(null);
	let practiceStatus = $state('Setting up the practice folder…');

	// Builds the lesson's practice folder each time a lesson opens.
	$effect(() => {
		const lesson = data.lesson;
		practiceFolderPath = null;
		if (lesson === null) {
			return;
		}
		if (!isTauri()) {
			practiceStatus = 'The terminal runs in the desktop app (pnpm tauri dev).';
			return;
		}
		practiceStatus = 'Setting up the practice folder…';
		createPracticeRepo(lesson.id, lesson.mission.setup)
			.then((folderPath) => (practiceFolderPath = folderPath))
			.catch((error: unknown) => (practiceStatus = `Setup failed: ${String(error)}`));
	});
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
		<section aria-label="Practice" class="flex min-w-0 flex-[999_1_26rem] flex-col gap-3 p-3">
			<div class="flex min-h-0 flex-[0_0_18rem] flex-col">
				<PracticeTerminal
					missionId={data.lesson.id}
					{practiceFolderPath}
					statusMessage={practiceStatus}
				/>
			</div>
		</section>
	</div>
{/if}
