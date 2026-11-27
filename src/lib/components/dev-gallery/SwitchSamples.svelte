<!--
  SwitchSamples.svelte
  Dev gallery: two working segmented switches (Pro / Book path and Visualizer / Terminal),
  so the chosen look, hover and keyboard focus can be checked in each theme.
  Input: none.
-->
<script lang="ts">
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';

	const pathOptions: SegmentedSwitchOption<string>[] = [
		{ value: 'pro', label: 'Pro path' },
		{ value: 'book', label: 'Book path' }
	];
	const panelOptions: SegmentedSwitchOption<string>[] = [
		{ value: 'visualizer', label: 'Visualizer' },
		{ value: 'terminal', label: 'Terminal' }
	];

	let chosenPath = $state('pro');
	let chosenPanel = $state('visualizer');

	/**
	 * Remembers the chosen course path.
	 * @param newPath - "pro" or "book"
	 */
	function choosePath(newPath: string): void {
		chosenPath = newPath;
	}

	/**
	 * Remembers the chosen practice panel.
	 * @param newPanel - "visualizer" or "terminal"
	 */
	function choosePanel(newPanel: string): void {
		chosenPanel = newPanel;
	}
</script>

<div class="flex flex-wrap items-center gap-3">
	<SegmentedSwitch
		groupLabel="Course path"
		options={pathOptions}
		value={chosenPath}
		onchange={choosePath}
	/>
	<SegmentedSwitch
		groupLabel="Practice panel"
		options={panelOptions}
		value={chosenPanel}
		onchange={choosePanel}
	/>
</div>
