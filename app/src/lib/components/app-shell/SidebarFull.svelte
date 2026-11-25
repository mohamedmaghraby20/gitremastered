<!--
  SidebarFull.svelte
  The full, 248px-wide sidebar: the main links with their text, the pilot lesson, and the book credit.
  Path progress and the current module's lessons arrive with the content loader (task 8 onwards).
  Input: currentPath, the path of the page on screen.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { isLinkActive, mainLinks } from '$lib/navigation/navigation-links';

	let { currentPath }: { currentPath: string } = $props();

	// The pilot lesson; task 8 replaces this with the current module's lessons from content/.
	const pilotLessonHref = resolve('/lessons/[lessonId]', { lessonId: 'three-areas' });
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

	<div class="flex flex-col gap-1 pl-3">
		<span class="type-caption text-ink-muted uppercase">Pilot lesson</span>
		<a
			href={pilotLessonHref}
			aria-current={isLinkActive(currentPath, pilotLessonHref) ? 'page' : undefined}
			class="type-small py-1 text-ink-muted hover:text-ink"
		>
			Status, stage, commit
		</a>
	</div>

	<p class="type-caption mt-auto pl-3 font-normal text-ink-muted normal-case">
		Built on Pro Git · CC BY-NC-SA
	</p>
</nav>
