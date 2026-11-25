<!--
  LayerTabs.svelte
  The layer tabs from DESIGN.md: "1 Use it / 2 How it works / 3 Pro", with a 2px primary
  underline on the active tab. Follows the WAI-ARIA tabs pattern: only the active tab is in the
  Tab order, and the Left / Right arrow keys (plus Home / End) move between tabs.

  Inputs:  layers (id + label for each tab), activeLayerId, onchange (called with the chosen id),
           panelIdPrefix (each tab points at the panel "<prefix>-<id>").
  Output:  a role="tablist" with one role="tab" button per layer.
-->
<script lang="ts" generics="LayerId extends string">
	import { tick } from 'svelte';

	let {
		layers,
		activeLayerId,
		onchange,
		panelIdPrefix
	}: {
		layers: readonly { id: LayerId; label: string }[];
		activeLayerId: LayerId;
		onchange: (layerId: LayerId) => void;
		panelIdPrefix: string;
	} = $props();

	let tabButtons: HTMLButtonElement[] = $state([]);

	/**
	 * Picks the tab an arrow key leads to, wrapping around at both ends.
	 * @param key - the pressed key's name
	 * @param currentIndex - the focused tab's position
	 * @returns the new position, or null for keys the tabs ignore
	 */
	function findTargetIndex(key: string, currentIndex: number): number | null {
		const lastIndex = layers.length - 1;
		if (key === 'ArrowRight') {
			return currentIndex === lastIndex ? 0 : currentIndex + 1;
		}
		if (key === 'ArrowLeft') {
			return currentIndex === 0 ? lastIndex : currentIndex - 1;
		}
		if (key === 'Home') {
			return 0;
		}
		if (key === 'End') {
			return lastIndex;
		}
		return null;
	}

	/**
	 * Moves to another tab with the keyboard, selecting it and focusing it.
	 * @param keyEvent - the key press on a tab
	 * @param currentIndex - the position of the tab that had focus
	 */
	async function handleKeydown(keyEvent: KeyboardEvent, currentIndex: number): Promise<void> {
		const targetIndex = findTargetIndex(keyEvent.key, currentIndex);
		if (targetIndex === null) {
			return;
		}
		keyEvent.preventDefault();
		onchange(layers[targetIndex].id);
		await tick();
		tabButtons[targetIndex]?.focus();
	}
</script>

<div role="tablist" aria-label="Lesson layers" class="flex gap-6 border-b">
	{#each layers as layer, index (layer.id)}
		{@const isActive = layer.id === activeLayerId}
		<button
			bind:this={tabButtons[index]}
			type="button"
			role="tab"
			id={`${panelIdPrefix}-tab-${layer.id}`}
			aria-selected={isActive}
			aria-controls={`${panelIdPrefix}-${layer.id}`}
			tabindex={isActive ? 0 : -1}
			onclick={() => onchange(layer.id)}
			onkeydown={(keyEvent) => handleKeydown(keyEvent, index)}
			class={[
				'type-button -mb-px cursor-pointer border-b-2 bg-transparent py-2.5',
				isActive ? 'border-primary text-ink' : 'border-transparent text-ink-muted hover:text-ink'
			]}
		>
			<span class="type-label-mono mr-1.5 text-ink-faint">{index + 1}</span>{layer.label}
		</button>
	{/each}
</div>
