<!--
  TerminalWindow.svelte
  The retro terminal window from DESIGN.md: a dark frame with a title bar (three window dots,
  the practice folder's name, a "bash" badge) around a warm screen with faint scanlines.
  It is the only element besides menus that casts a shadow.

  Inputs: folderLabel (shown in the title bar, e.g. "~/practice/three-areas"),
          children (what goes on the screen, normally TerminalView).
  The window itself can take focus, so F6 in the terminal can move focus here.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		folderLabel,
		children,
		windowElement = $bindable()
	}: { folderLabel: string; children: Snippet; windowElement?: HTMLElement } = $props();
</script>

<section
	bind:this={windowElement}
	aria-label="Terminal"
	tabindex="-1"
	class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-large bg-terminal-chrome shadow-window"
>
	<div class="type-label-mono flex items-center gap-3 px-3.5 py-2 text-terminal-muted">
		<span class="flex gap-1.5" aria-hidden="true">
			{#each [1, 2, 3] as dotNumber (dotNumber)}
				<span class="size-2.5 rounded-full border border-terminal-muted"></span>
			{/each}
		</span>
		<span class="flex-1 truncate text-center">{folderLabel}</span>
		<span class="rounded-small border border-terminal-muted px-1.5">bash</span>
	</div>
	<div class="terminal-screen min-h-0 flex-1 bg-terminal-bg px-4 py-3">
		{@render children()}
	</div>
</section>

<style>
	/* Faint horizontal scanlines over the screen, like an old monitor. */
	.terminal-screen {
		background-image: repeating-linear-gradient(
			to bottom,
			color-mix(in srgb, var(--terminal-ink) 2.5%, transparent) 0,
			color-mix(in srgb, var(--terminal-ink) 2.5%, transparent) 1px,
			transparent 1px,
			transparent 3px
		);
	}
</style>
