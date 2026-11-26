<!--
  ModuleBlock.svelte
  One module of the Pro path on the course map: a header (number badge, title, a short
  summary like "1 of 2 done") and its lessons as rows. The badge is highlighted while the
  module holds the lesson open now.

  Input: group (the module and its lesson rows).
-->
<script lang="ts">
	import type { ModuleGroup } from '$lib/course-map/course-map-data';
	import LessonRowLink from './LessonRowLink.svelte';

	let { group }: { group: ModuleGroup } = $props();

	const isCurrentModule = $derived(group.rows.some((row) => row.status === 'current'));
</script>

<section
	aria-labelledby={`module-${group.id}`}
	class="overflow-hidden rounded-medium border bg-surface"
>
	<div class="flex flex-wrap items-center gap-3 px-5 py-3.5">
		<span
			class={[
				'type-label-mono rounded-small border border-primary px-1.5 font-bold',
				isCurrentModule ? 'bg-highlight text-on-highlight' : 'bg-surface'
			]}
		>
			{group.numberLabel}
		</span>
		<h2 id={`module-${group.id}`} class="type-h3 m-0 flex-1">{group.title}</h2>
		<span class="type-small text-ink-muted">{group.summary}</span>
	</div>
	{#each group.rows as row (row.id)}
		<LessonRowLink {row} />
	{/each}
</section>
