/**
 * terminal-connection.ts
 * Connects one terminal screen to one shell session in the Rust core: starts the session,
 * passes output to the screen in order, sends typed keys and size changes, and closes it.
 *
 * One subtle point: the shell can print its prompt before startSession() has even returned
 * the session ID. Output that arrives while the ID is unknown is kept and shown once it is.
 */

import type { UnlistenFn } from '@tauri-apps/api/event';
import type { TerminalOutput } from '$lib/tauri/events';
import type { TerminalBridge } from './terminal-bridge';

/** The line shown when the shell ends by itself (for example after typing "exit"). */
export const shellEndedMessage =
	'\r\n[The shell ended. Use "Reset practice" to start a new one.]\r\n';

/** One terminal screen's link to its shell session. */
export class TerminalConnection {
	private readonly bridge: TerminalBridge;
	private readonly writeToScreen: (text: string) => void;
	private sessionId: string | null = null;
	private outputBeforeStart: TerminalOutput[] = [];
	private stopListeners: UnlistenFn[] = [];
	private isClosed = false;

	/**
	 * @param bridge - the Rust core's terminal actions and events
	 * @param writeToScreen - shows text on the terminal screen
	 */
	constructor(bridge: TerminalBridge, writeToScreen: (text: string) => void) {
		this.bridge = bridge;
		this.writeToScreen = writeToScreen;
	}

	/**
	 * Starts listening, starts the shell in a practice folder, and sends the screen's size.
	 * @param practiceFolderPath - where the shell starts
	 * @param columns - characters per line on screen
	 * @param rows - lines on screen
	 */
	async open(practiceFolderPath: string, columns: number, rows: number): Promise<void> {
		this.stopListeners.push(
			await this.bridge.listenForOutput((output) => this.receiveOutput(output)),
			await this.bridge.listenForExit((exited) => {
				if (exited.sessionId === this.sessionId) {
					this.writeToScreen(shellEndedMessage);
				}
			})
		);
		const sessionId = await this.bridge.startSession(practiceFolderPath);
		if (this.isClosed) {
			await this.bridge.closeSession(sessionId);
			return;
		}
		this.sessionId = sessionId;
		this.showOutputFromBeforeStart(sessionId);
		await this.bridge.resize(sessionId, columns, rows);
	}

	/**
	 * Sends typed keys or pasted text to the shell.
	 * @param text - the characters
	 */
	sendInput(text: string): void {
		if (this.sessionId !== null) {
			void this.bridge.sendInput(this.sessionId, text);
		}
	}

	/**
	 * Tells the shell the screen's new size.
	 * @param columns - characters per line
	 * @param rows - lines
	 */
	resize(columns: number, rows: number): void {
		if (this.sessionId !== null) {
			void this.bridge.resize(this.sessionId, columns, rows);
		}
	}

	/** Stops listening and stops the shell. Safe to call more than once. */
	async close(): Promise<void> {
		this.isClosed = true;
		for (const stopListening of this.stopListeners) {
			stopListening();
		}
		this.stopListeners = [];
		if (this.sessionId !== null) {
			const sessionId = this.sessionId;
			this.sessionId = null;
			await this.bridge.closeSession(sessionId);
		}
	}

	/**
	 * Shows output that belongs to this session; keeps it for later if the ID is not known yet.
	 * @param output - one output event (from any session)
	 */
	private receiveOutput(output: TerminalOutput): void {
		if (this.sessionId === null) {
			this.outputBeforeStart.push(output);
			return;
		}
		if (output.sessionId === this.sessionId) {
			this.writeToScreen(output.text);
		}
	}

	/**
	 * Shows the kept output of this session, in order, and forgets the rest.
	 * @param sessionId - this connection's session
	 */
	private showOutputFromBeforeStart(sessionId: string): void {
		for (const output of this.outputBeforeStart) {
			if (output.sessionId === sessionId) {
				this.writeToScreen(output.text);
			}
		}
		this.outputBeforeStart = [];
	}
}
