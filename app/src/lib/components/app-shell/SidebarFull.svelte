<!--
  SidebarFull.svelte
  The full, 248px-wide sidebar: the main links with their text, the current module's lessons
  (from content/, with a ✓ on finished ones), and the book credit.
  Input: currentPath, the path of the page on screen.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { getFirstModuleOutline } from '$lib/content/course-content';
	import { progress } from '$lib/stores/progress';
	import { isLinkActive, mainLinks } from '$lib/navigation/navigation-links';

	let { currentPath }: { currentPath: string } = $props();

	// The lessons of the module the student is in (for now: the first module of the pro path).
	const moduleOutline = getFirstModuleOutline();
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

	{#if moduleOutline !== null}
		<div class="flex flex-col gap-1 pl-3">
			<span class="type-caption text-ink-muted uppercase">{moduleOutline.moduleTitle}</span>
			<ul class="flex flex-col">
				{#each moduleOutline.lessons as lesson (lesson.id)}
					{@const lessonHref = resolve('/lessons/[lessonId]', { lessonId: lesson.id })}
					<li>
						<a
							href={lessonHref}
							aria-current={isLinkActive(currentPath, lessonHref) ? 'page' : undefined}
							class="type-small flex py-1 text-ink-muted hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
						>
							<span class="flex-1">{lesson.title}</span>
							{#if $progress.finishedMissions.includes(lesson.id)}
								<span class="text-success" aria-label="done">✓</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<p class="type-caption mt-auto pl-3 font-normal text-ink-muted normal-case">
		Built on Pro Git · CC BY-NC-SA
	</p>
</nav>
