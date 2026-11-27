<!--
  SidebarFull.svelte
  The full, 248px-wide sidebar from the prototype: the main links with their text, progress
  along the chosen path ("Pro path 1 / 2" with a bar), the lessons of the module the student
  is in, and the book credit.
  Input: currentPath, the path of the page on screen.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { progress } from '$lib/stores/progress';
	import { isLinkActive, mainLinks } from '$lib/navigation/navigation-links';
	import { buildProModules, findCurrentModule } from '$lib/course-map/course-map-data';
	import { countPathProgress } from '$lib/progress/learning-summary';
	import { ProgressBar } from '$lib/components/ui/progress-bar';
	import SidebarModuleLessons from './SidebarModuleLessons.svelte';

	let { currentPath }: { currentPath: string } = $props();

	const modules = $derived(buildProModules($progress));
	const currentModule = $derived(findCurrentModule(modules));
	const allLessonIds = $derived(modules.flatMap((group) => group.rows.map((row) => row.id)));
	const pathProgress = $derived(countPathProgress($progress, allLessonIds));
	const pathLabel = $derived($progress.chosenPathId === 'book-path' ? 'Book path' : 'Pro path');
</script>

<nav
	aria-label="Main"
	class="flex w-62 shrink-0 flex-col gap-6 border-r bg-surface-sunken py-4 pr-3"
>
	<ul class="flex flex-col gap-0.5">
		{#each mainLinks as link (link.href)}
			{@const isActive = isLinkActive(currentPath, link.href)}
			<li>
				<a
					href={resolve(link.href)}
					aria-current={isActive ? 'page' : undefined}
					class={[
						'type-small flex rounded-r-small border-l-2 px-3 py-2',
						isActive
							? 'border-primary bg-surface font-semibold text-ink'
							: 'border-transparent text-ink-muted hover:text-ink'
					]}
				>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>

	<div class="pl-3">
		<ProgressBar
			label={pathLabel}
			doneCount={pathProgress.doneCount}
			totalCount={pathProgress.totalCount}
		/>
	</div>

	{#if currentModule !== undefined}
		<SidebarModuleLessons group={currentModule} {currentPath} />
	{/if}

	<p class="type-caption mt-auto pl-3 font-normal text-ink-muted normal-case">
		Built on Pro Git · CC BY-NC-SA
	</p>
</nav>
