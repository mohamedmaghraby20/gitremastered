<!--
  PracticeColumn.svelte
  The right side of the lesson screen: the visualizer board on top and the terminal below,
  both following the lesson's practice session.
  In a small window (below 1100px, DESIGN.md) they share one panel: a Visualizer / Terminal
  switch shows one at a time. The other one is only hidden, never removed, so the terminal's
  shell keeps running and its history stays.

  Inputs: missionId (the lesson ID), session (the lesson's practice session),
          snapshot (the latest repo snapshot, or null).
-->
<script lang="ts">
	import type { PracticeSession } from '$lib/mission-engine/practice-session.svelte';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import PracticeTerminal from '$lib/components/terminal-view/PracticeTerminal.svelte';
	import HistoryMap from '$lib/components/visualizer/HistoryMap.svelte';
	import VisualizerBoard from '$lib/components/visualizer/VisualizerBoard.svelte';
	import {
		SegmentedSwitch,
		type SegmentedSwitchOption
	} from '$lib/components/ui/segmented-switch';
	import { progress, saveFilesDeskFolded } from '$lib/stores/progress';

	let {
		missionId,
		session,
		snapshot
	}: { missionId: string; session: PracticeSession; snapshot: RepoSnapshot | null } = $props();

	type PracticeTool = 'visualizer' | 'terminal';
	const toolOptions: SegmentedSwitchOption<PracticeTool>[] = [
		{ value: 'visualizer', label: 'Visualizer' },
		{ value: 'terminal', label: 'Terminal' }
	];

	/** The tool shown in a small window; a large window shows both. */
	let shownTool: PracticeTool = $state('terminal');

	/**
	 * Passes a typed command line to the session, for the caption.
	 * @param commandLine - the line the student entered
	 */
	function recordCommand(commandLine: string): void {
		session.recordCommandLine(commandLine);
	}

	/**
	 * Remembers that the student folded or unfolded the files desk.
	 * @param isFolded - the new state
	 */
	function rememberDeskFolded(isFolded: boolean): void {
		void saveFilesDeskFolded(isFolded);
	}

	/**
	 * Shows the tool picked with the small-window switch.
	 * @param tool - "visualizer" or "terminal"
	 */
	function showTool(tool: PracticeTool): void {
		shownTool = tool;
	}
</script>

<section
	aria-label="Practice"
	class="flex h-full min-w-0 flex-[999_1_26rem] flex-col gap-3 p-3 narrow:flex-[1_1_27.5rem]"
>
	<div class="hidden narrow:flex">
		<SegmentedSwitch
			groupLabel="Practice tool"
			options={toolOptions}
			value={shownTool}
			onchange={showTool}
		/>
	</div>
	<div
		class={[
			'flex min-h-0 flex-1 flex-col',
			shownTool === 'visualizer' ? '' : 'narrow:hidden'
		]}
	>
		<VisualizerBoard
			{snapshot}
			caption={session.lastCaption}
			isDeskFolded={$progress.isFilesDeskFolded}
			onDeskToggle={rememberDeskFolded}
		>
			{#snippet history()}
				<HistoryMap {snapshot} />
			{/snippet}
		</VisualizerBoard>
	</div>
	<div
		class={[
			'flex min-h-0 flex-[0_0_55%] flex-col narrow:flex-1',
			shownTool === 'terminal' ? '' : 'narrow:hidden'
		]}
	>
		<PracticeTerminal
			{missionId}
			practiceFolderPath={session.practiceFolderPath}
			statusMessage={session.statusMessage}
			onCommand={recordCommand}
		/>
	</div>
</section>
