<!--
  segmented-switch.svelte
  The segmented switch from DESIGN.md: an outlined group of buttons with a 3px keycap edge;
  the chosen option is filled with the primary color. Used for theme, Pro / Book path, and
  Visualizer / Terminal.

  Inputs:  groupLabel (read by screen readers, like "Theme"), options (value + label for each),
           value (the chosen option's value), onchange (called with the newly chosen value).
  Output:  a group of real <button> elements; the chosen one has aria-pressed="true".
-->
<script lang="ts" generics="Value extends string">
	import type { SegmentedSwitchOption } from './segmented-switch-options';

	let {
		groupLabel,
		options,
		value,
		onchange
	}: {
		groupLabel: string;
		options: readonly SegmentedSwitchOption<Value>[];
		value: Value;
		onchange: (newValue: Value) => void;
	} = $props();
</script>

<div
	role="group"
	aria-label={groupLabel}
	class="inline-flex overflow-hidden rounded-medium border border-b-3 border-border-strong"
>
	{#each options as option (option.value)}
		{@const isChosen = option.value === value}
		<button
			type="button"
			aria-pressed={isChosen}
			onclick={() => onchange(option.value)}
			class={[
				'type-button cursor-pointer px-4 py-2 transition-colors duration-(--duration-fast)',
				isChosen ? 'bg-primary text-on-primary' : 'bg-surface text-ink hover:bg-surface-sunken'
			]}
		>
			{option.label}
		</button>
	{/each}
</div>
