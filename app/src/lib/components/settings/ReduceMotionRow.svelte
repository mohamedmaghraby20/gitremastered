<!--
  ReduceMotionRow.svelte
  Settings row: a "Reduce motion" checkbox. On, the visualizer changes instantly instead of
  animating and the terminal cursor stops blinking. It is also on by itself when the computer
  asks for reduced motion; then the box is checked and cannot be turned off here.
  Input: none (reads and saves the progress store).
-->
<script lang="ts">
	import { progress, saveMotionReduced } from '$lib/stores/progress';
	import { applyReducedMotion } from '$lib/settings/display-settings';
	import SettingRow from './SettingRow.svelte';

	const isReducedBySystem = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/**
	 * Applies and saves the checkbox's new state.
	 * @param changeEvent - the checkbox's change event
	 */
	function changeMotion(changeEvent: Event): void {
		const isReduced = (changeEvent.currentTarget as HTMLInputElement).checked;
		applyReducedMotion(isReduced);
		void saveMotionReduced(isReduced);
	}
</script>

<SettingRow
	name="Reduce motion"
	explanation={isReducedBySystem
		? 'On, because your computer asks for less motion.'
		: 'The visualizer changes instantly instead of animating.'}
	controlId="reduce-motion"
>
	<input
		id="reduce-motion"
		type="checkbox"
		checked={isReducedBySystem || $progress.isMotionReduced}
		disabled={isReducedBySystem}
		onchange={changeMotion}
		class="size-5 accent-primary"
	/>
</SettingRow>
