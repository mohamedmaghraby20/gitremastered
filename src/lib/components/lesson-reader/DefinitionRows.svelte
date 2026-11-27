<!--
  DefinitionRows.svelte
  Definition rows from DESIGN.md: a term on the left (with a swatch in its Git area's look:
  draft, highlighted or inked) and its meaning on the right, separated by hairlines.
  Input: items, each { term, area (or null), text }.
-->
<script lang="ts">
	import type { DefinitionItem } from '@gitremastered/course-engine/content/render-blocks';
	import { renderInlineMarkdown } from '@gitremastered/course-engine/content/render-markdown';

	let { items }: { items: DefinitionItem[] } = $props();

	/** The swatch look for each Git area (DESIGN.md "draft → highlighted → inked"). */
	const swatchClasses = {
		working: 'border border-dashed border-git-working',
		staging: 'border border-git-staging-edge bg-git-staging',
		repository: 'bg-git-repository'
	} as const;
</script>

<dl class="m-0 flex flex-col">
	{#each items as item (item.term)}
		<div
			class="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-3.5 border-t py-2.5 last:border-b"
		>
			<dt class="type-small flex items-center gap-2 font-semibold">
				{#if item.area !== null}
					<span
						data-testid="area-swatch"
						data-area={item.area}
						aria-hidden="true"
						class={['size-2.5 shrink-0 rounded-small', swatchClasses[item.area]]}
					></span>
				{/if}
				{item.term}
			</dt>
			<dd class="lesson-lede type-lesson m-0">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
				{@html renderInlineMarkdown(item.text)}
			</dd>
		</div>
	{/each}
</dl>
