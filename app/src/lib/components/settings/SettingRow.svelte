<!--
  SettingRow.svelte
  One row of a Settings card: the setting's name and a short explanation on the left, its
  control on the right. The name is a <label> when the control is a single input, so clicking
  the name moves focus to the control.

  Inputs: name, explanation, controlId (the input's id, to make the name its label; optional),
          children (the control).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		name,
		explanation,
		controlId,
		children
	}: { name: string; explanation: string; controlId?: string; children: Snippet } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 first:border-t-0">
	<div>
		{#if controlId === undefined}
			<div class="font-semibold">{name}</div>
		{:else}
			<label for={controlId} class="font-semibold">{name}</label>
		{/if}
		<div class="type-small text-ink-muted">{explanation}</div>
	</div>
	{@render children()}
</div>
