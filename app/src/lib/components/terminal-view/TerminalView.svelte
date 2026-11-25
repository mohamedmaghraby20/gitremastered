<!--
  TerminalView.svelte
  The terminal screen: an xterm.js terminal connected to a real shell in a practice folder.
  Colors and font come from the terminal tokens; it refits when its pane changes size;
  Esc moves keyboard focus out of the terminal (DESIGN.md accessibility rule).

  Inputs:  practiceFolderPath (where the shell starts),
           bridge (the Rust core's terminal actions; tests pass a fake),
           onEscape (called after Esc, to move focus somewhere useful).
-->
<script lang="ts">
	import '@xterm/xterm/css/xterm.css';
	import { Terminal } from '@xterm/xterm';
	import { FitAddon } from '@xterm/addon-fit';
	import { buildTerminalFont, buildTerminalTheme, readTokensFrom } from './terminal-theme';
	import { tauriTerminalBridge, type TerminalBridge } from './terminal-bridge';
	import { TerminalConnection } from './terminal-connection';

	let {
		practiceFolderPath,
		bridge = tauriTerminalBridge,
		onEscape = () => {}
	}: { practiceFolderPath: string; bridge?: TerminalBridge; onEscape?: () => void } = $props();

	let screenElement: HTMLDivElement;

	/**
	 * Builds the xterm.js terminal with our tokens, honoring "reduce motion" for the cursor blink.
	 * @returns the terminal, not yet attached to the page
	 */
	function createTerminal(): Terminal {
		const readToken = readTokensFrom(screenElement);
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return new Terminal({
			theme: buildTerminalTheme(readToken),
			...buildTerminalFont(readToken),
			cursorBlink: !prefersReducedMotion,
			cursorStyle: 'block',
			scrollback: 2000
		});
	}

	/**
	 * Makes Esc leave the terminal instead of reaching the shell.
	 * @param terminal - the terminal
	 */
	function letEscapeLeave(terminal: Terminal): void {
		terminal.attachCustomKeyEventHandler((keyEvent) => {
			if (keyEvent.key !== 'Escape') {
				return true;
			}
			if (keyEvent.type === 'keydown') {
				terminal.blur();
				onEscape();
			}
			return false;
		});
	}

	$effect(() => {
		const terminal = createTerminal();
		const fitAddon = new FitAddon();
		terminal.loadAddon(fitAddon);
		terminal.open(screenElement);
		fitAddon.fit();
		letEscapeLeave(terminal);

		const connection = new TerminalConnection(bridge, (text) => terminal.write(text));
		terminal.onData((typedText) => connection.sendInput(typedText));
		terminal.onResize((size) => connection.resize(size.cols, size.rows));
		void connection.open(practiceFolderPath, terminal.cols, terminal.rows).catch((error) => {
			terminal.write(`\r\nThe terminal could not start: ${String(error)}\r\n`);
		});

		const resizeObserver = new ResizeObserver(() => fitAddon.fit());
		resizeObserver.observe(screenElement);

		return () => {
			resizeObserver.disconnect();
			void connection.close();
			terminal.dispose();
		};
	});
</script>

<div bind:this={screenElement} class="h-full min-h-0 w-full" data-testid="terminal-screen"></div>
