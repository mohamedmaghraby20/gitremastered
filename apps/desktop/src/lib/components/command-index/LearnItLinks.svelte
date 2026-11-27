<!--
  LearnItLinks.svelte
  "Learn it": keycap links to the lessons that teach a command or term, and the Pro Git
  section, which opens in the system browser.

  Inputs: lessonCards (the lessons, in order), bookUrl (the Pro Git link, or null),
          bookLabel (the link's text, e.g. "Pro Git 2.2").
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { LessonCard } from '$lib/content/course-content';
	import { buttonVariants } from '$lib/components/ui/button';
	import { handleExternalLinkClick } from '$lib/tauri/open-external';

	let {
		lessonCards,
		bookUrl,
		bookLabel
	}: { lessonCards: LessonCard[]; bookUrl: string | null; bookLabel: string } = $props();

	/**
	 * Opens the Pro Git link in the system browser instead of inside the app.
	 * @param event - the click
	 */
	function openBookLink(event: MouseEvent): void {
		if (bookUrl !== null) {
			handleExternalLinkClick(event, bookUrl);
		}
	}
</script>

<div class="flex flex-wrap items-center gap-2.5">
	{#each lessonCards as card (card.id)}
		<a
			href={resolve('/lessons/[lessonId]', { lessonId: card.id })}
			class={buttonVariants({ variant: 'secondary' })}
		>
			{#if card.numberLabel !== null}
				<span class="type-label-mono text-ink-faint">{card.numberLabel}</span>
			{/if}
			{card.title}
		</a>
	{/each}
	{#if bookUrl !== null}
		<!-- The online Pro Git is not an app page, so SvelteKit's resolve() does not apply.
		     In the desktop app the click opens the system browser (see open-external.ts). -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			href={bookUrl}
			target="_blank"
			rel="noreferrer"
			onclick={openBookLink}
			class="type-small px-1 py-2"
		>
			{bookLabel} ↗
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	{/if}
</div>
