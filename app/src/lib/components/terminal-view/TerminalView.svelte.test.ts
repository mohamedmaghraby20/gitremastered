/**
 * TerminalView.svelte.test.ts
 * Component tests for the terminal screen in a real browser, with a fake Rust bridge:
 * it starts the shell, shows output, sends typed keys, and lets Esc move focus out.
 */

// The terminal reads its colors and font from the design tokens, as in the app.
import '$lib/styles/tokens.css';
import '$lib/styles/fonts.css';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { TerminalOutput } from '$lib/tauri/events';
import type { TerminalBridge } from './terminal-bridge';
import TerminalView from './TerminalView.svelte';

/**
 * Builds a fake bridge whose shell prints a prompt as soon as it starts.
 * @returns the bridge
 */
function createFakeBridge() {
	let handleOutput: (output: TerminalOutput) => void = () => {};
	return {
		startSession: vi.fn<TerminalBridge['startSession']>(() => {
			handleOutput({ sessionId: 'terminal-1', text: 'three-areas ❯ ' });
			return Promise.resolve('terminal-1');
		}),
		sendInput: vi.fn<TerminalBridge['sendInput']>(() => Promise.resolve()),
		resize: vi.fn(async () => {}),
		closeSession: vi.fn(async () => {}),
		listenForOutput: vi.fn((handler: (output: TerminalOutput) => void) => {
			handleOutput = handler;
			return Promise.resolve(() => {});
		}),
		listenForExit: vi.fn(() => Promise.resolve(() => {}))
	} satisfies TerminalBridge;
}

describe('TerminalView', () => {
	it('starts the shell in the practice folder and shows its output', async () => {
		const bridge = createFakeBridge();
		await render(TerminalView, { practiceFolderPath: '/practice/three-areas', bridge });

		await expect.element(page.getByText('three-areas ❯')).toBeVisible();
		expect(bridge.startSession).toHaveBeenCalledWith('/practice/three-areas');
	});

	it('sends what the student types to the shell', async () => {
		const bridge = createFakeBridge();
		await render(TerminalView, { practiceFolderPath: '/practice/x', bridge });
		await expect.element(page.getByText('three-areas ❯')).toBeVisible();

		await page.getByTestId('terminal-screen').click();
		await userEvent.keyboard('ls');

		const sentText = bridge.sendInput.mock.calls.map((call) => call[1]).join('');
		expect(sentText).toBe('ls');
	});

	it('moves focus out of the terminal on Esc', async () => {
		const bridge = createFakeBridge();
		const onEscape = vi.fn();
		await render(TerminalView, { practiceFolderPath: '/practice/x', bridge, onEscape });
		await page.getByTestId('terminal-screen').click();

		await userEvent.keyboard('{Escape}');

		expect(onEscape).toHaveBeenCalledOnce();
		const screen = page.getByTestId('terminal-screen').element();
		expect(screen.contains(document.activeElement)).toBe(false);
		expect(bridge.sendInput).not.toHaveBeenCalled();
	});
});
