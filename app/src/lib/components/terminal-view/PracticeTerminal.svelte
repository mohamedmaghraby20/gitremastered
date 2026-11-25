<!--
  PracticeTerminal.svelte
  The terminal window for a lesson: the retro frame with the live terminal inside, once the
  practice folder is ready. Before that (or outside the desktop app) it shows a short status line.

  Inputs: missionId (names the folder in the title bar), practiceFolderPath (null until ready),
          statusMessage (shown while there is no folder, e.g. "Setting up the practice folder…").
-->
<script lang="ts">
	import TerminalView from './TerminalView.svelte';
	import TerminalWindow from './TerminalWindow.svelte';

	let {
		missionId,
		practiceFolderPath,
		statusMessage
	}: { missionId: string; practiceFolderPath: string | null; statusMessage: string } = $props();

	let windowElement: HTMLElement | undefined = $state();
</script>

<TerminalWindow folderLabel={`~/practice/${missionId}`} bind:windowElement>
	{#if practiceFolderPath === null}
		<p class="type-terminal m-0 text-terminal-muted">{statusMessage}</p>
	{:else}
		{#key practiceFolderPath}
			<TerminalView {practiceFolderPath} onEscape={() => windowElement?.focus()} />
		{/key}
	{/if}
</TerminalWindow>
