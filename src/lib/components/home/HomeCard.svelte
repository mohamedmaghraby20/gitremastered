<!--
  HomeCard.svelte
  The frame shared by the small home cards (Your path, Up next, Quick review): a white card
  with a hairline border, a mono heading, an optional note on the right, and the content.

  Inputs: title (the card's heading), aside (optional: a small note or control beside the
          heading), children (the card's content).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, aside, children }: { title: string; aside?: Snippet; children: Snippet } = $props();
</script>

<section aria-label={title} class="flex flex-col gap-4 rounded-medium border bg-surface p-6">
	<div class="flex items-center justify-between gap-2">
		<h2 class="type-h3 m-0">{title}</h2>
		{@render aside?.()}
	</div>
	{@render children()}
</section>
