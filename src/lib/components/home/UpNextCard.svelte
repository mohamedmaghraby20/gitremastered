<!--
  UpNextCard.svelte
  "Up next": the next unfinished lessons of the chosen path, each with its number, title and
  reading time, as links.

  Input: cards (the lessons to list, in order; empty when every lesson is done).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LessonCard } from '$lib/content/course-content';
	import HomeCard from './HomeCard.svelte';

	let { cards }: { cards: LessonCard[] } = $props();
</script>

<HomeCard title="Up next">
	{#if cards.length === 0}
		<p class="type-small m-0 text-ink-muted">
			Every lesson written so far is done. New lessons appear here as the course grows.
		</p>
	{:else}
		<ul class="m-0 flex list-none flex-col p-0">
			{#each cards as card (card.id)}
				<li class="border-t">
					<a
						href={resolve('/lessons/[lessonId]', { lessonId: card.id })}
						class="type-body flex items-baseline gap-3 py-2 text-ink no-underline hover:underline"
					>
						<span class="type-label-mono text-ink-faint">{card.numberLabel ?? '··'}</span>
						<span class="flex-1">{card.title}</span>
						<span class="type-small text-ink-muted">{card.readingMinutes} min</span>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</HomeCard>
