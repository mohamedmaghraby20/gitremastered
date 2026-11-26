<!--
  ChapterBlock.svelte
  One Pro Git chapter on the course map's Book path: a header ("Ch 2" and the title), then each
  section (number and title, in the book's serif) with the lessons that teach it as rows.

  Input: group (the chapter, its sections and their lesson rows).
-->
<script lang="ts">
	import type { ChapterGroup } from '$lib/course-map/course-map-data';
	import LessonRowLink from './LessonRowLink.svelte';

	let { group }: { group: ChapterGroup } = $props();
</script>

<section
	aria-labelledby={`chapter-${group.number}`}
	class="overflow-hidden rounded-medium border bg-surface"
>
	<div class="flex items-center gap-3 px-5 py-3.5">
		<span class="type-label-mono rounded-small border border-primary px-1.5 font-bold">
			Ch {group.number}
		</span>
		<h2 id={`chapter-${group.number}`} class="type-h3 m-0">{group.title}</h2>
	</div>
	{#each group.sections as section (section.number)}
		<h3 class="type-sidenote m-0 flex gap-3 border-t bg-surface-sunken px-5 py-2 font-normal">
			<span class="type-label-mono w-10 text-ink-faint">{section.number}</span>
			{section.title}
		</h3>
		{#each section.rows as row (row.id)}
			<LessonRowLink {row} />
		{/each}
	{/each}
</section>
