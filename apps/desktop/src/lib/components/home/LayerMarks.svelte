<!--
  LayerMarks.svelte
  The row under the continue card's lede: ✓ for the layers read, → for the next one, then the
  mission and the quiz. The marks have words for screen readers ("read", "next").

  Input: furthestLayerId (the deepest layer opened, or undefined).
-->
<script lang="ts">
	import type { LessonLayerId } from '@gitremastered/course-engine/types/lesson';
	import { findLayerMarks } from '$lib/home/layer-marks';

	let { furthestLayerId }: { furthestLayerId: LessonLayerId | undefined } = $props();

	const layerMarks = $derived(findLayerMarks(furthestLayerId));
</script>

<ul class="type-small m-0 flex list-none flex-wrap gap-4 p-0 text-ink-muted">
	{#each layerMarks as layerMark (layerMark.number)}
		<li class={layerMark.state === 'next' ? 'font-semibold text-ink' : ''}>
			{#if layerMark.state === 'read'}
				<span class="font-semibold text-success" aria-hidden="true">✓</span>
				<span class="sr-only">Read:</span>
			{:else if layerMark.state === 'next'}
				<span aria-hidden="true">→</span>
				<span class="sr-only">Next:</span>
			{/if}
			{layerMark.number}
			{layerMark.label}
		</li>
	{/each}
	<li>· Challenges · Quiz</li>
</ul>
