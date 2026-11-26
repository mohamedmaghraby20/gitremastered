<!--
  LessonBlocks.svelte
  Shows one lesson section: plain Markdown as reading text, and each ":::name" block as its own
  small component (see render-blocks.ts for the markers).
  Input: markdown, one lesson section (already checked by the content loader).
-->
<script lang="ts">
	import { splitIntoBlocks } from '$lib/content/render-blocks';
	import CarefulNote from './CarefulNote.svelte';
	import CommitGraphDiagram from './CommitGraphDiagram.svelte';
	import CompareCells from './CompareCells.svelte';
	import DefinitionRows from './DefinitionRows.svelte';
	import LessonMarkdown from './LessonMarkdown.svelte';
	import PredictQuestion from './PredictQuestion.svelte';
	import Sidenote from './Sidenote.svelte';
	import TryItSteps from './TryItSteps.svelte';

	let { markdown }: { markdown: string } = $props();

	// The loader already rejected broken blocks, so the file name here is only a fallback label.
	const blocks = $derived(splitIntoBlocks(markdown, 'lesson section'));
</script>

<div class="flex flex-col gap-4">
	{#each blocks as block, index (index)}
		{#if block.kind === 'markdown'}
			<LessonMarkdown markdown={block.markdown} />
		{:else if block.kind === 'definitions'}
			<DefinitionRows items={block.items} />
		{:else if block.kind === 'try-it'}
			<TryItSteps markdown={block.markdown} />
		{:else if block.kind === 'careful'}
			<CarefulNote markdown={block.markdown} />
		{:else if block.kind === 'sidenote'}
			<Sidenote markdown={block.markdown} />
		{:else if block.kind === 'compare'}
			<CompareCells today={block.today} book={block.book} />
		{:else if block.kind === 'predict'}
			<PredictQuestion question={block.question} answer={block.answer} />
		{:else if block.kind === 'graph'}
			<CommitGraphDiagram graph={block.graph} />
		{/if}
	{/each}
</div>
