<!--
  LessonHeader.svelte
  The top of a lesson: the eyebrow (lesson number box, module, Pro Git citation) and the title.
  Inputs: title, lessonNumber (e.g. "05", or null if the lesson is in no path), moduleTitle,
          bookSection (e.g. "2.2 Recording Changes"), bookUrl (the online Pro Git section).
-->
<script lang="ts">
	let {
		title,
		lessonNumber,
		moduleTitle,
		bookSection,
		bookUrl
	}: {
		title: string;
		lessonNumber: string | null;
		moduleTitle: string;
		bookSection: string;
		bookUrl: string;
	} = $props();
</script>

<header class="flex flex-col gap-2.5">
	<div class="type-caption flex flex-wrap items-center gap-2 text-ink-muted uppercase">
		{#if lessonNumber !== null}
			<span
				class="type-label-mono rounded-small border border-border-strong px-1.5 py-px text-ink normal-case"
			>
				{lessonNumber}
			</span>
		{/if}
		<span>{moduleTitle}</span>
		<span aria-hidden="true">·</span>
		<!-- The online Pro Git is not an app page, so SvelteKit's resolve() does not apply. -->
		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<a
			href={bookUrl}
			target="_blank"
			rel="noreferrer"
			class="tracking-normal text-link normal-case hover:underline"
		>
			Pro Git {bookSection}
		</a>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->
	</div>
	<h1 class="type-h1 m-0">{title}</h1>
</header>
