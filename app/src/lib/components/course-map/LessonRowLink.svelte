<!--
  LessonRowLink.svelte
  One lesson in the course map, as a link that opens it: number, title, source ("Pro Git 2.2"),
  reading time, and a mark: ✓ done, ● the lesson open now. The marks have words for screen
  readers, so status is never shown by color alone (DESIGN.md).

  Input: row (the lesson's card and its status).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LessonRow } from '$lib/course-map/course-map-data';

	let { row }: { row: LessonRow } = $props();

	/** The words a screen reader says after the title, for each status. */
	const statusWords = { done: 'done', current: 'current lesson', todo: '' };
</script>

<a
	href={resolve('/lessons/[lessonId]', { lessonId: row.id })}
	aria-current={row.status === 'current' ? 'step' : undefined}
	class={[
		'grid grid-cols-[2.5rem_minmax(0,1fr)_7rem_4.5rem_1.75rem] items-center gap-3 border-t px-5 py-2.5',
		'type-body text-ink no-underline hover:bg-surface-sunken',
		row.status === 'current' &&
			'bg-git-staging-wash font-semibold shadow-[inset_3px_0_0_var(--primary)]'
	]}
>
	<span class="type-label-mono text-ink-faint">{row.numberLabel ?? '··'}</span>
	<span class="min-w-0">{row.title}</span>
	<span class="type-label-mono text-ink-muted">{row.sourceLabel}</span>
	<span class="type-small text-ink-muted">{row.readingMinutes} min</span>
	<span class="type-label-mono font-bold">
		{#if row.status === 'done'}
			<span class="text-success" aria-hidden="true">✓</span>
		{:else if row.status === 'current'}
			<span class="text-primary" aria-hidden="true">●</span>
		{/if}
		{#if row.status !== 'todo'}
			<span class="sr-only">{statusWords[row.status]}</span>
		{/if}
	</span>
</a>
