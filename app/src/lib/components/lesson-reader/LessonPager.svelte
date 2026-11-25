<!--
  LessonPager.svelte
  The Previous / Next links at the bottom of the lesson column.
  Inputs: previousLesson and nextLesson (each a lesson link, or null at either end of the path).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatLessonNumber, type LessonLink } from '$lib/content/lesson-navigation';

	let {
		previousLesson,
		nextLesson
	}: { previousLesson: LessonLink | null; nextLesson: LessonLink | null } = $props();
</script>

<nav
	aria-label="Lessons"
	class="type-small flex items-center justify-between gap-3 border-t bg-surface px-9 py-3"
>
	{#if previousLesson !== null}
		<a
			href={resolve('/lessons/[lessonId]', { lessonId: previousLesson.id })}
			class="text-ink-muted hover:text-ink"
		>
			← {formatLessonNumber(previousLesson.lessonNumber)}
			{previousLesson.title}
		</a>
	{:else}
		<span></span>
	{/if}
	{#if nextLesson !== null}
		<a
			href={resolve('/lessons/[lessonId]', { lessonId: nextLesson.id })}
			class="font-semibold text-ink hover:underline"
		>
			{formatLessonNumber(nextLesson.lessonNumber)}
			{nextLesson.title} →
		</a>
	{/if}
</nav>
