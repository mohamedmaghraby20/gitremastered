<!--
  segmented-switch.svelte
  The segmented switch from docs/DESIGN.md: an outlined group with a 3px keycap edge; the chosen
  option is filled with the primary color. Used for theme, Pro / Book path, and
  Visualizer / Terminal.

  It is a real radio group (WAI-ARIA pattern): the whole group is one Tab stop, the arrow keys
  move and choose, Home and End jump to the ends, and Tab leaves the group.

  Inputs:  groupLabel (read by screen readers, like "Theme"), options (value + label for each),
           value (the chosen option's value), onchange (called with the newly chosen value).
  Output:  a radiogroup of <button role="radio"> elements; the chosen one has aria-checked="true".
-->
<script lang="ts" generics="Value extends string">
	import type { SegmentedSwitchOption } from './segmented-switch-options';
	import { findNextOptionIndex } from './switch-keys';

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

	/** The option buttons, in order, so the arrow keys can move focus between them. */
	const optionButtons: HTMLButtonElement[] = $state([]);

	/**
	 * Moves focus and the choice when an arrow, Home or End key is pressed on an option.
	 * @param keyEvent - the key press
	 * @param currentIndex - the position of the option that has focus
	 */
	function handleOptionKey(keyEvent: KeyboardEvent, currentIndex: number): void {
		const nextIndex = findNextOptionIndex(currentIndex, keyEvent.key, options.length);
		if (nextIndex === null) {
			return;
		}
		keyEvent.preventDefault();
		optionButtons[nextIndex].focus();
		onchange(options[nextIndex].value);
	}
</script>

<div
	role="radiogroup"
	aria-label={groupLabel}
	class="inline-flex overflow-hidden rounded-medium border border-b-3 border-border-strong"
>
	{#each options as option, optionIndex (option.value)}
		{@const isChosen = option.value === value}
		<button
			bind:this={optionButtons[optionIndex]}
			type="button"
			role="radio"
			aria-checked={isChosen}
			tabindex={isChosen ? 0 : -1}
			onclick={() => onchange(option.value)}
			onkeydown={(keyEvent) => handleOptionKey(keyEvent, optionIndex)}
			class={[
				'type-button cursor-pointer px-4 py-2 transition-colors duration-(--duration-fast)',
				'focus-visible:outline-2 focus-visible:-outline-offset-4',
				isChosen
					? 'bg-primary text-on-primary focus-visible:outline-on-primary'
					: 'bg-surface text-ink hover:bg-surface-sunken focus-visible:outline-primary'
			]}
		>
			{option.label}
		</button>
	{/each}
</div>
