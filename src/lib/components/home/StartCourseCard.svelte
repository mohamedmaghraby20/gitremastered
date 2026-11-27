<!--
  StartCourseCard.svelte
  What a first-time student sees instead of "Pick up where you left off": what the course is,
  and a button that opens the first lesson of the chosen path.

  Input: card (the first lesson's list card, or null if the course has no lessons yet).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LessonCard } from '$lib/content/course-content';
	import { buttonVariants } from '$lib/components/ui/button';

	let { card }: { card: LessonCard | null } = $props();
</script>

<section
	aria-label="Start the course"
	class="flex flex-col gap-4 rounded-medium border bg-surface px-8 py-7"
>
	<p class="type-lede m-0 max-w-[60ch]">
		Learn Git the way professionals use it: read a short lesson, then practise in a real terminal
		while a live picture shows what Git did. Every lesson is built on the Pro Git book.
	</p>
	{#if card !== null}
		<p class="type-body m-0 text-ink-muted">
			The first lesson is <span class="font-semibold text-ink">{card.title}</span>, about
			{card.readingMinutes} minutes.
		</p>
		<div class="flex flex-wrap gap-3">
			<a
				href={resolve('/lessons/[lessonId]', { lessonId: card.id })}
				class={buttonVariants({ variant: 'primary' })}
			>
				Start the first lesson
				<kbd class="type-label-mono rounded-small border border-current px-1 opacity-75">⏎</kbd>
			</a>
			<a href={resolve('/course-map')} class={buttonVariants({ variant: 'secondary' })}>
				Open course map
			</a>
		</div>
	{/if}
</section>
