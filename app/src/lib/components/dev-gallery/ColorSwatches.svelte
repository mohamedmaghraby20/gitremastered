<!--
  ColorSwatches.svelte
  Dev gallery: a grid with one swatch per color token, painted with the token's CSS variable,
  so the swatch shows whatever theme its surroundings use.
  Input: colorTokens, the color list from tokens.json.
-->
<script lang="ts">
	import type { NamedToken, ThemedValue } from '$lib/types/design-tokens';

	let { colorTokens }: { colorTokens: NamedToken<ThemedValue>[] } = $props();
</script>

<ul class="swatch-grid">
	{#each colorTokens as colorToken (colorToken.name)}
		<li class="swatch-card">
			<span
				class="swatch"
				data-swatch={colorToken.name}
				style:background={`var(--${colorToken.name})`}
			></span>
			<span class="type-label-mono">{colorToken.name}</span>
		</li>
	{/each}
</ul>

<style>
	/* Auto-filling grid of small cards. */
	.swatch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(calc(var(--space-16) * 2), 1fr));
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.swatch-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		color: var(--ink-muted);
	}

	/* The color itself, with a hairline so pale colors stay visible. */
	.swatch {
		height: var(--space-8);
		border: 1px solid var(--border);
		border-radius: var(--radius-small);
	}
</style>
