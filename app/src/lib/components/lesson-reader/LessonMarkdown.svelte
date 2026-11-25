<!--
  LessonMarkdown.svelte
  Shows one piece of lesson Markdown as HTML, in the lesson's reading styles (lesson-prose.css).
  Input: markdown, the text from a lesson section.
-->
<script lang="ts">
	import { renderMarkdown } from '$lib/content/render-markdown';

	let { markdown }: { markdown: string } = $props();

	const html = $derived(renderMarkdown(markdown));
</script>

<div class="lesson-prose">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
	{@html html}
</div>
