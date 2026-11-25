<!--
  Sidenote.svelte
  A sidenote from DESIGN.md: a Pro Git quote or margin note in the italic sidenote style,
  under a small "From Pro Git" label.
  Input: markdown, the note's text.
-->
<script lang="ts">
	import LessonMarkdown from './LessonMarkdown.svelte';

	let { markdown }: { markdown: string } = $props();
</script>

<aside role="note" aria-label="From Pro Git" class="flex flex-col gap-1.5 border-l pl-4">
	<span class="type-caption text-ink-faint uppercase">From Pro Git</span>
	<div class="sidenote-text">
		<LessonMarkdown {markdown} />
	</div>
</aside>

<style>
	/* Sidenotes use the smaller italic serif style. */
	.sidenote-text :global(.lesson-prose) {
		color: var(--ink-muted);
		font-family: var(--type-sidenote-family);
		font-size: var(--type-sidenote-size);
		line-height: var(--type-sidenote-line-height);
		font-style: var(--type-sidenote-style);
	}
</style>
