<!--
  RecapCard.svelte
  The recap card at the end of a lesson: the "Recap" section in a bordered card, readable on
  its own when a student comes back to review.
  Input: markdown, the lesson's Recap section.
-->
<script lang="ts">
	import LessonMarkdown from './LessonMarkdown.svelte';

	let { markdown }: { markdown: string } = $props();
</script>

<section aria-labelledby="recap-heading" class="rounded-medium border bg-surface px-5 py-4">
	<h2 id="recap-heading" class="type-caption m-0 mb-2 text-ink-muted uppercase">Recap</h2>
	<LessonMarkdown {markdown} />
</section>
