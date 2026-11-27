<!--
  CompareCells.svelte
  The "Use today / In the book" comparison from docs/DESIGN.md ("New vs. old"): two cells side by
  side, the current command on the left and the one Pro Git shows on the right.
  Inputs: today and book, each one line of Markdown.
-->
<script lang="ts">
	import { renderInlineMarkdown } from '@gitremastered/course-engine/content/render-markdown';

	let { today, book }: { today: string; book: string } = $props();

	const cells = $derived([
		{ label: 'Use today', markdown: today, isSunken: false },
		{ label: 'In the book', markdown: book, isSunken: true }
	]);
</script>

<section
	aria-label="Use today and in the book"
	class="grid grid-cols-2 overflow-hidden rounded-medium border"
>
	{#each cells as cell (cell.label)}
		<div
			class={['flex flex-col gap-1.5 px-3.5 py-3', cell.isSunken && 'border-l bg-surface-sunken']}
		>
			<span class="type-caption text-ink-muted uppercase">{cell.label}</span>
			<p class="lesson-lede type-body m-0">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
				{@html renderInlineMarkdown(cell.markdown)}
			</p>
		</div>
	{/each}
</section>
