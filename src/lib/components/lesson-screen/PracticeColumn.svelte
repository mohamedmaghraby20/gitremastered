<!--
  PracticeColumn.svelte
  The right side of the lesson screen: the visualizer board on top and the terminal below,
  both following the lesson's practice session.
  In a small window (below 1100px, DESIGN.md) they share one panel: a Visualizer / Terminal
  switch shows one at a time. The other one is only hidden, never removed, so the terminal's
  shell keeps running and its history stays. In a large window, the handle between the two
  resizes them (the terminal takes 25% to 80% of the height; double-click resets).

  Inputs: missionId (the lesson ID), session (the lesson's practice session),
          snapshot (the latest repo snapshot, or null).
-->
<script lang="ts">
	import type { PracticeSession } from '$lib/mission-engine/practice-session.svelte';
	import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
	import PracticeTerminal from '$lib/components/terminal-view/PracticeTerminal.svelte';
	import HistoryPanel from '$lib/components/visualizer/HistoryPanel.svelte';
	import VisualizerBoard from '$lib/components/visualizer/VisualizerBoard.svelte';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import { progress, saveFilesDeskFolded, savePanelSizes } from '$lib/stores/progress';
	import { ResizeHandle } from '$lib/components/ui/resize-handle';
	import { terminalLimits } from '$lib/layout/panel-sizes';

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

	/** The visualizer's limits: what is left when the terminal is at its own limits. */
	const visualizerLimits = {
		smallest: 100 - terminalLimits.largest,
		largest: 100 - terminalLimits.smallest
	};

	/** The terminal's share while dragging; it starts from the saved share. */
	let draggedTerminalShare: number | null | undefined = $state(undefined);
	const terminalShare = $derived(
		draggedTerminalShare === undefined ? $progress.terminalShare : draggedTerminalShare
	);

	/**
	 * Shows the terminal at a new height while the handle moves.
	 * @param visualizerShare - the visualizer's share (the panel above the handle), in percent
	 */
	function showTerminalShare(visualizerShare: number): void {
		draggedTerminalShare = 100 - visualizerShare;
	}

	/**
	 * Saves the terminal's height once the drag or key press is done.
	 * @param visualizerShare - the visualizer's share, in percent
	 */
	function saveTerminalShare(visualizerShare: number): void {
		draggedTerminalShare = undefined;
		void savePanelSizes({ terminalShare: 100 - visualizerShare });
	}

	/** Goes back to the design's terminal height (double-click on the handle). */
	function resetTerminalShare(): void {
		draggedTerminalShare = undefined;
		void savePanelSizes({ terminalShare: null });
	}

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
	<div class={['flex min-h-0 flex-1 flex-col', shownTool === 'visualizer' ? '' : 'narrow:hidden']}>
		<VisualizerBoard
			{snapshot}
			caption={session.lastCaption}
			isDeskFolded={$progress.isFilesDeskFolded}
			onDeskToggle={rememberDeskFolded}
		>
			{#snippet history()}
				<HistoryPanel {snapshot} />
			{/snippet}
		</VisualizerBoard>
	</div>
	<ResizeHandle
		direction="rows"
		label="Resize the visualizer and the terminal"
		limits={visualizerLimits}
		onresize={showTerminalShare}
		onresizeend={saveTerminalShare}
		onreset={resetTerminalShare}
		class="-my-1.5 narrow:hidden"
	/>
	<div
		style:--terminal-share={terminalShare === null ? undefined : `${terminalShare}%`}
		class={[
			'flex min-h-0 flex-[0_0_var(--terminal-share,55%)] flex-col narrow:flex-1',
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
