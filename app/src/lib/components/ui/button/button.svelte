<!--
  button.svelte
  The keycap Button from DESIGN.md: a key with a 3px bottom edge that presses down 2px when clicked.
  Variants: primary (the one main action on a screen), secondary (companion actions), ghost (quiet).
  The classes for each variant live in button-variants.ts.

  Inputs:  variant ("primary" | "secondary" | "ghost"), shortcut (optional key hint, like "Enter"),
           children (the label), plus any normal <button> attribute (onclick, disabled, type…).
  Output:  a real <button> element.
-->
<script lang="ts">
	import { cn } from '$lib/utils';
	import { buttonVariants, type ButtonProps } from './button-variants';

	let {
		variant = 'primary',
		shortcut,
		type = 'button',
		class: extraClasses,
		children,
		...buttonAttributes
	}: ButtonProps = $props();
</script>

<button
	{type}
	data-variant={variant}
	class={cn(buttonVariants({ variant }), extraClasses)}
	{...buttonAttributes}
>
	{@render children?.()}
	{#if shortcut}
		<!-- The shortcut key, outlined in the label's own color. -->
		<kbd class="type-label-mono rounded-small border border-current px-1 opacity-75">
			{shortcut}
		</kbd>
	{/if}
</button>
