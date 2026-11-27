<!--
  DeskZone.svelte
  One compact zone on the files desk: a one-line header (the area's name and a count) and the
  area's items below. The area's look follows docs/DESIGN.md "draft → highlighted → inked".
  The short explanation ("what you're editing") is the header's tooltip, to save height.

  Inputs: name (e.g. "Staging area"), hint (the tooltip), tone ("working", "staging" or
          "repository"), countLabel (e.g. "2 files"), children (the items).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		name,
		hint,
		tone,
		countLabel,
		children
	}: {
		name: string;
		hint: string;
		tone: 'working' | 'staging' | 'repository';
		countLabel: string;
		children: Snippet;
	} = $props();

	/** The zone's colors and edge for each area. */
	const toneClasses = {
		working: 'border border-dashed border-git-working bg-surface',
		staging: 'border border-git-staging-edge bg-git-staging-wash',
		repository: 'bg-git-repository text-on-git-repository'
	};
</script>

<section
	aria-label={name}
	class={['flex min-h-14 min-w-0 flex-col gap-1 rounded-medium p-1.5', toneClasses[tone]]}
>
	<h3
		class={[
			'type-label-mono m-0 flex justify-between gap-2 px-0.5 font-bold',
			tone === 'staging' && 'text-git-staging-edge'
		]}
		title={hint}
	>
		<span class="truncate">{name}</span>
		<span class="shrink-0 font-normal opacity-80">{countLabel}</span>
	</h3>
	<ul class="m-0 flex list-none flex-col gap-1 p-0">
		{@render children()}
	</ul>
</section>
