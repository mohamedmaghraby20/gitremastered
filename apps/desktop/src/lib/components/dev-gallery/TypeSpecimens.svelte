<!--
  TypeSpecimens.svelte
  Dev gallery: shows each text style (h1, lede, body, code…) with its sample sentence.
  Input: typeGroups, the type groups from tokens.json.
-->
<script lang="ts">
	import type { TypeGroup } from '$lib/types/design-tokens';

	let { typeGroups }: { typeGroups: TypeGroup[] } = $props();
</script>

<dl class="specimen-list">
	{#each typeGroups as typeGroup (typeGroup.name)}
		{#each typeGroup.styles as typeStyle (typeStyle.name)}
			<div class="specimen-row">
				<dt class="type-caption">{typeStyle.name}</dt>
				<dd class={`type-${typeStyle.name}`}>{typeStyle.sample ?? typeStyle.name}</dd>
			</div>
		{/each}
	{/each}
</dl>

<style>
	.specimen-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
	}

	/* Style name on the left, the sample on the right. */
	.specimen-row {
		display: grid;
		grid-template-columns: var(--space-16) 1fr;
		gap: var(--space-4);
		align-items: baseline;
	}

	.specimen-row dt {
		color: var(--ink-faint);
		text-transform: uppercase;
	}

	.specimen-row dd {
		margin: 0;
	}
</style>
