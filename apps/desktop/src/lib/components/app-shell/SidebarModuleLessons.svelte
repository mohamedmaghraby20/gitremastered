<!--
  SidebarModuleLessons.svelte
  The sidebar's lesson list: the module the student is in ("00 · Your daily loop"), then its
  lessons with their numbers, a ✓ on finished ones (with the word "done" for screen readers),
  and the lesson on screen marked with the highlighter.

  Inputs: group (the module and its lesson rows), currentPath (the page on screen).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ModuleGroup } from '$lib/course-map/course-map-data';
	import { isLinkActive } from '$lib/navigation/navigation-links';

	let { group, currentPath }: { group: ModuleGroup; currentPath: string } = $props();
</script>

<div class="flex flex-col gap-1 pl-3">
	<span class="type-caption mb-1.5 text-ink-muted uppercase">
		{group.numberLabel} · {group.title}
	</span>
	<ul class="flex flex-col">
		{#each group.rows as row (row.id)}
			{@const lessonHref = resolve('/lessons/[lessonId]', { lessonId: row.id })}
			{@const isOnScreen = isLinkActive(currentPath, lessonHref)}
			<li>
				<a
					href={lessonHref}
					aria-current={isOnScreen ? 'page' : undefined}
					class={[
						'type-small flex items-center gap-2 py-1',
						isOnScreen ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink'
					]}
				>
					<span class="type-label-mono w-5 shrink-0 text-ink-faint">{row.numberLabel ?? ''}</span>
					<span class={['flex-1', isOnScreen && 'bg-highlight px-1 text-on-highlight']}>
						{row.title}
					</span>
					{#if row.status === 'done'}
						<span class="type-label-mono font-bold text-success" aria-hidden="true">✓</span>
						<span class="sr-only">done</span>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</div>
