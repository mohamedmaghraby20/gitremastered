<!--
  PracticeColumn.svelte
  The right side of the lesson screen: the visualizer board on top and the terminal below,
  both following the lesson's practice session.

  Inputs: missionId (the lesson ID), session (the lesson's practice session),
          snapshot (the latest repo snapshot, or null).
-->
<script lang="ts">
	import type { PracticeSession } from '$lib/mission-engine/practice-session.svelte';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import PracticeTerminal from '$lib/components/terminal-view/PracticeTerminal.svelte';
	import VisualizerBoard from '$lib/components/visualizer/VisualizerBoard.svelte';

	let {
		missionId,
		session,
		snapshot
	}: { missionId: string; session: PracticeSession; snapshot: RepoSnapshot | null } = $props();

	/**
	 * Passes a typed command line to the session, for the caption.
	 * @param commandLine - the line the student entered
	 */
	function recordCommand(commandLine: string): void {
		session.recordCommandLine(commandLine);
	}
</script>

<section aria-label="Practice" class="flex min-w-0 flex-[999_1_26rem] flex-col gap-3 p-3">
	<VisualizerBoard {snapshot} caption={session.lastCaption} />
	<div class="flex min-h-0 flex-[0_0_18rem] flex-col">
		<PracticeTerminal
			{missionId}
			practiceFolderPath={session.practiceFolderPath}
			statusMessage={session.statusMessage}
			onCommand={recordCommand}
		/>
	</div>
</section>
