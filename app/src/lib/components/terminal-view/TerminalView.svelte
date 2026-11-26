<!--
  TerminalView.svelte
  The terminal screen: an xterm.js terminal connected to a real shell in a practice folder.
  Colors and font come from the terminal tokens; it refits when its pane changes size;
  F6 moves keyboard focus out of the terminal (DESIGN.md accessibility rule); Esc goes to the shell.
  Ctrl V pastes, Ctrl C copies selected text, Ctrl + / − / 0 change the text size
  (the shortcuts themselves are in terminal-keys.ts).

  Inputs:  practiceFolderPath (where the shell starts),
           bridge (the Rust core's terminal actions; tests pass a fake),
           savedFontSize (the student's text size in pixels, or null for the design's size),
           onFontSizeChange (called with the new size, or null when back at the design's size),
           onLeave (called after F6, to move focus somewhere useful),
           onCommand (called with each command line the student enters, for the caption).
-->
<script lang="ts">
	import '@xterm/xterm/css/xterm.css';
	import { untrack } from 'svelte';
	import { Terminal } from '@xterm/xterm';
	import { FitAddon } from '@xterm/addon-fit';
	import { buildTerminalFont, buildTerminalTheme, readTokensFrom } from './terminal-theme';
	import { tauriTerminalBridge, type TerminalBridge } from './terminal-bridge';
	import { TerminalConnection } from './terminal-connection';
	import {
		findTerminalShortcut,
		nextFontSize,
		type TerminalShortcut,
		type TextSizeShortcut
	} from './terminal-keys';
	import { CommandLineTracker } from '$lib/visualizer/command-line-tracker';

	let {
		practiceFolderPath,
		bridge = tauriTerminalBridge,
		savedFontSize = null,
		onFontSizeChange = () => {},
		onLeave = () => {},
		onCommand = () => {}
	}: {
		practiceFolderPath: string;
		bridge?: TerminalBridge;
		savedFontSize?: number | null;
		onFontSizeChange?: (fontSize: number | null) => void;
		onLeave?: () => void;
		onCommand?: (commandLine: string) => void;
	} = $props();

	let screenElement: HTMLDivElement;

	/**
	 * Builds the xterm.js terminal with our tokens, honoring "reduce motion" for the cursor blink.
	 * @param fontSize - the text size to start with, in pixels
	 * @returns the terminal, not yet attached to the page
	 */
	function createTerminal(fontSize: number): Terminal {
		const readToken = readTokensFrom(screenElement);
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return new Terminal({
			theme: buildTerminalTheme(readToken),
			...buildTerminalFont(readToken),
			fontSize,
			cursorBlink: !prefersReducedMotion,
			cursorStyle: 'block',
			scrollback: 2000
		});
	}

	/**
	 * Lets the terminal's own shortcuts act before xterm.js sends keys to the shell.
	 * Returning false tells xterm.js to leave the key alone; for paste and copy that lets the
	 * browser do its usual paste and copy, which xterm.js then handles.
	 * @param terminal - the terminal
	 * @param resizeText - changes the text size for a text-size shortcut
	 */
	function handleTerminalKeys(
		terminal: Terminal,
		resizeText: (shortcut: TextSizeShortcut) => void
	): void {
		terminal.attachCustomKeyEventHandler((keyEvent) => {
			const shortcut = findTerminalShortcut(keyEvent, terminal.hasSelection());
			if (shortcut === null) {
				return true;
			}
			if (keyEvent.type === 'keydown') {
				runShortcut(terminal, shortcut, keyEvent, resizeText);
			}
			return false;
		});
	}

	/**
	 * Does what one shortcut asks, on key down.
	 * @param terminal - the terminal
	 * @param shortcut - the shortcut pressed
	 * @param keyEvent - the key press (text-size keys stop here, so the page does not zoom)
	 * @param resizeText - changes the text size
	 */
	function runShortcut(
		terminal: Terminal,
		shortcut: TerminalShortcut,
		keyEvent: KeyboardEvent,
		resizeText: (shortcut: TextSizeShortcut) => void
	): void {
		if (shortcut === 'leave') {
			terminal.blur();
			onLeave();
		} else if (shortcut === 'copy') {
			// The browser copies next; clearing afterwards makes the next Ctrl C stop commands again.
			setTimeout(() => terminal.clearSelection(), 0);
		} else if (shortcut !== 'paste') {
			keyEvent.preventDefault();
			resizeText(shortcut);
		}
	}

	/**
	 * Applies a text-size shortcut, refits the screen and reports the new size.
	 * @param terminal - the terminal
	 * @param fitAddon - refits rows and columns to the new size
	 * @param shortcut - larger, smaller or default text
	 * @param designFontSize - the size from the design tokens
	 */
	function resizeTerminalText(
		terminal: Terminal,
		fitAddon: FitAddon,
		shortcut: TextSizeShortcut,
		designFontSize: number
	): void {
		const currentSize = terminal.options.fontSize ?? designFontSize;
		const newSize = nextFontSize(currentSize, shortcut, designFontSize);
		terminal.options.fontSize = newSize;
		fitAddon.fit();
		onFontSizeChange(newSize === designFontSize ? null : newSize);
	}

	$effect(() => {
		const designFontSize = buildTerminalFont(readTokensFrom(screenElement)).fontSize;
		// Read once, untracked: a later size change must not restart the shell.
		const startingFontSize = untrack(() => savedFontSize) ?? designFontSize;
		const terminal = createTerminal(startingFontSize);
		const fitAddon = new FitAddon();
		terminal.loadAddon(fitAddon);
		terminal.open(screenElement);
		fitAddon.fit();
		handleTerminalKeys(terminal, (shortcut) =>
			resizeTerminalText(terminal, fitAddon, shortcut, designFontSize)
		);

		const connection = new TerminalConnection(bridge, (text) => terminal.write(text));
		const commandLineTracker = new CommandLineTracker();
		terminal.onData((typedText) => {
			connection.sendInput(typedText);
			for (const commandLine of commandLineTracker.receive(typedText)) {
				onCommand(commandLine);
			}
		});
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
