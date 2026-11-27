/**
 * terminal-bridge.ts
 * Everything the terminal view needs from the Rust core, in one small interface.
 * The app uses the real Tauri version; component tests pass in a fake one.
 */

import type { UnlistenFn } from '@tauri-apps/api/event';
import {
	closeTerminalSession,
	resizeTerminal,
	sendTerminalInput,
	startTerminalSession
} from '$lib/tauri/commands';
import {
	onTerminalExited,
	onTerminalOutput,
	type TerminalExited,
	type TerminalOutput
} from '$lib/tauri/events';

/** The shell-session actions and events the terminal view uses. */
export type TerminalBridge = {
	startSession: (practiceFolderPath: string) => Promise<string>;
	sendInput: (sessionId: string, text: string) => Promise<void>;
	resize: (sessionId: string, columns: number, rows: number) => Promise<void>;
	closeSession: (sessionId: string) => Promise<void>;
	listenForOutput: (handleOutput: (output: TerminalOutput) => void) => Promise<UnlistenFn>;
	listenForExit: (handleExit: (exited: TerminalExited) => void) => Promise<UnlistenFn>;
};

/** The real bridge: the typed Tauri wrappers. */
export const tauriTerminalBridge: TerminalBridge = {
	startSession: startTerminalSession,
	sendInput: sendTerminalInput,
	resize: resizeTerminal,
	closeSession: closeTerminalSession,
	listenForOutput: onTerminalOutput,
	listenForExit: onTerminalExited
};
