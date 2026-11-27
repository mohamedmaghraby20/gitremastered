<!--
  PartHeading.svelte
  The heading that opens one practice part under the lesson text (the challenge, the quiz):
  the part's name, and one line saying what this part is for, so a student
  never mistakes the challenge for the quiz.

  Inputs: headingId (so the part's section can point to its heading), title, description,
          aside (optional: shown at the right end, like the quiz score).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		headingId,
		title,
		description,
		aside
	}: { headingId: string; title: string; description: string; aside?: Snippet } = $props();
</script>

<header class="flex flex-col gap-1">
	<div class="flex items-baseline justify-between gap-3">
		<h2 id={headingId} class="type-h3 m-0">{title}</h2>
		{@render aside?.()}
	</div>
	<p class="type-small m-0 text-ink-muted">{description}</p>
</header>
