<!--
  TryItSteps.svelte
  A "Try it" box: short numbered steps the student does in the terminal right now.
  Input: markdown, the steps (a numbered list).
-->
<script lang="ts">
	import LessonMarkdown from './LessonMarkdown.svelte';

	let { markdown }: { markdown: string } = $props();
</script>

<section
	aria-label="Try it"
	class="flex flex-col gap-2 rounded-medium border bg-surface-sunken px-4 py-3"
>
	<span class="type-caption text-ink-muted uppercase">Try it</span>
	<LessonMarkdown {markdown} />
</section>
