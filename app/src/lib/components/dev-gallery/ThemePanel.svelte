<!--
  ThemePanel.svelte
  Dev gallery: one panel locked to a theme (data-theme), showing the buttons, the lesson blocks, every color and every text style.
  Two of these side by side show light and dark at the same time.
  Inputs: themeId ("light" or "dark"), title, and the parsed tokens.json.
-->
<script lang="ts">
	import type { DesignTokens } from '$lib/types/design-tokens';
	import ButtonSamples from './ButtonSamples.svelte';
	import ColorSwatches from './ColorSwatches.svelte';
	import LessonBlockSamples from './LessonBlockSamples.svelte';
	import TypeSpecimens from './TypeSpecimens.svelte';

	let {
		themeId,
		title,
		designTokens
	}: { themeId: 'light' | 'dark'; title: string; designTokens: DesignTokens } = $props();
</script>

<section class="theme-panel" data-theme={themeId} aria-label={title}>
	<h2 class="type-h2">{title}</h2>
	<h3 class="type-h3">Buttons</h3>
	<ButtonSamples />
	<h3 class="type-h3">Lesson blocks</h3>
	<LessonBlockSamples />
	<h3 class="type-h3">Colors</h3>
	<ColorSwatches colorTokens={designTokens.color.tokens} />
	<h3 class="type-h3">Text styles</h3>
	<TypeSpecimens typeGroups={designTokens.type.groups} />
</section>

<style>
	/* The panel paints its own background, so its theme shows even inside the other one. */
	.theme-panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-6);
		background: var(--surface);
		color: var(--ink);
		border: 1px solid var(--border);
		border-radius: var(--radius-large);
	}

	.theme-panel h2,
	.theme-panel h3 {
		margin: 0;
	}
</style>
