<!--
  CarefulNote.svelte
  A "Careful" note from docs/DESIGN.md: a warning the student should not miss, marked with the word
  "Careful" and a 2px warning rule (never by color alone).
  Input: markdown, the note's text.
-->
<script lang="ts">
	import LessonMarkdown from './LessonMarkdown.svelte';

	let { markdown }: { markdown: string } = $props();
</script>

<aside
	role="note"
	aria-label="Careful"
	class="flex flex-col gap-1 rounded-medium border border-l-2 border-l-warning px-4 py-2.5"
>
	<span class="type-caption text-warning uppercase">Careful</span>
	<div class="careful-text">
		<LessonMarkdown {markdown} />
	</div>
</aside>

<style>
	/* A note reads a little smaller than the lesson text around it. */
	.careful-text :global(.lesson-prose) {
		font-family: var(--type-body-family);
		font-size: var(--type-body-size);
		line-height: var(--type-body-line-height);
	}
</style>
