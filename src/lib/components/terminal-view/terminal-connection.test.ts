/**
 * terminal-connection.test.ts
 * Tests for connecting a terminal screen to a shell session, with a fake bridge.
 */

import { describe, expect, it, vi } from 'vitest';
import type { TerminalExited, TerminalOutput } from '$lib/tauri/events';
import type { TerminalBridge } from './terminal-bridge';
import { shellEndedMessage, TerminalConnection } from './terminal-connection';

/**
 * Builds a fake bridge that remembers the event handlers, so tests can fire events.
 * @param beforeStartReturns - runs just before startSession returns (to fire early output)
 * @returns the bridge and functions to fire output and exit events
 */
function createFakeBridge(beforeStartReturns: () => void = () => {}) {
	let handleOutput: (output: TerminalOutput) => void = () => {};
	let handleExit: (exited: TerminalExited) => void = () => {};
	const bridge = {
		startSession: vi.fn<TerminalBridge['startSession']>(() => {
			beforeStartReturns();
			return Promise.resolve('terminal-1');
		}),
		sendInput: vi.fn<TerminalBridge['sendInput']>(() => Promise.resolve()),
		resize: vi.fn(async () => {}),
		closeSession: vi.fn(async () => {}),
		listenForOutput: vi.fn((handler: (output: TerminalOutput) => void) => {
			handleOutput = handler;
			return Promise.resolve(() => {});
		}),
		listenForExit: vi.fn((handler: (exited: TerminalExited) => void) => {
			handleExit = handler;
			return Promise.resolve(() => {});
		})
	} satisfies TerminalBridge;
	return {
		bridge,
		fireOutput: (output: TerminalOutput) => handleOutput(output),
		fireExit: (exited: TerminalExited) => handleExit(exited)
	};
}

describe('TerminalConnection', () => {
	it('starts the shell in the practice folder and sends the screen size', async () => {
		const { bridge } = createFakeBridge();
		const connection = new TerminalConnection(bridge, () => {});

		await connection.open('/practice/three-areas', 100, 30);

		expect(bridge.startSession).toHaveBeenCalledWith('/practice/three-areas');
		expect(bridge.resize).toHaveBeenCalledWith('terminal-1', 100, 30);
	});

	it("shows only this session's output, in order", async () => {
		const shownText: string[] = [];
		const fake = createFakeBridge();
		const connection = new TerminalConnection(fake.bridge, (text) => shownText.push(text));
		await connection.open('/practice/x', 80, 24);

		fake.fireOutput({ sessionId: 'terminal-1', text: 'one ' });
		fake.fireOutput({ sessionId: 'terminal-9', text: 'other session' });
		fake.fireOutput({ sessionId: 'terminal-1', text: 'two' });

		expect(shownText).toEqual(['one ', 'two']);
	});

	it('keeps output that arrives before the session ID is known', async () => {
		const shownText: string[] = [];
		const fake = createFakeBridge(() => {
			fake.fireOutput({ sessionId: 'terminal-1', text: 'early prompt ❯ ' });
		});
		const connection = new TerminalConnection(fake.bridge, (text) => shownText.push(text));

		await connection.open('/practice/x', 80, 24);

		expect(shownText).toEqual(['early prompt ❯ ']);
	});

	it('sends typed text and size changes to the session', async () => {
		const { bridge } = createFakeBridge();
		const connection = new TerminalConnection(bridge, () => {});
		await connection.open('/practice/x', 80, 24);

		connection.sendInput('git status\r');
		connection.resize(120, 40);

		expect(bridge.sendInput).toHaveBeenCalledWith('terminal-1', 'git status\r');
		expect(bridge.resize).toHaveBeenLastCalledWith('terminal-1', 120, 40);
	});

	it('says so when the shell ends', async () => {
		const shownText: string[] = [];
		const fake = createFakeBridge();
		const connection = new TerminalConnection(fake.bridge, (text) => shownText.push(text));
		await connection.open('/practice/x', 80, 24);

		fake.fireExit({ sessionId: 'terminal-1', exitCode: 0 });

		expect(shownText).toEqual([shellEndedMessage]);
	});

	it('closes the session once, even if close is called twice', async () => {
		const { bridge } = createFakeBridge();
		const connection = new TerminalConnection(bridge, () => {});
		await connection.open('/practice/x', 80, 24);

		await connection.close();
		await connection.close();

		expect(bridge.closeSession).toHaveBeenCalledTimes(1);
	});
});
