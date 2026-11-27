/**
 * student-actions.ts
 * What a student does in the app, as small named actions on top of the DevTools connection:
 * open a lesson, type a command in the terminal, read the terminal, click a button,
 * and wait for something to appear on screen.
 */

import type { DevToolsConnection } from './devtools-connection.ts';
import { pause } from './review-app.ts';

/** How often waitUntil checks the screen again. */
const pollIntervalMilliseconds = 10;

/** The actions of one student in one running app. */
export class StudentActions {
	private readonly connection: DevToolsConnection;

	/**
	 * @param connection - an open connection to the app's page
	 */
	constructor(connection: DevToolsConnection) {
		this.connection = connection;
	}

	/**
	 * Opens a lesson like a student would: through the course map, which lists every lesson
	 * (the sidebar only lists the lessons of the current module).
	 * @param lessonId - the lesson ID, e.g. "three-areas"
	 */
	async openLesson(lessonId: string): Promise<void> {
		await this.waitUntil(`document.querySelector('a[href$="/course-map"]') !== null`, 20_000);
		await this.connection.evaluate(`document.querySelector('a[href$="/course-map"]').click()`);
		await this.waitUntil(`location.pathname.endsWith('/course-map')`);
		await this.waitUntil(`document.querySelector('a[href$="/lessons/${lessonId}"]') !== null`);
		await this.connection.evaluate(
			`document.querySelector('a[href$="/lessons/${lessonId}"]').click()`
		);
		await this.waitUntil(`location.pathname.endsWith('/lessons/${lessonId}')`);
	}

	/**
	 * Waits until the terminal's shell has printed its prompt ("$" at the end of a line).
	 * @param timeoutMilliseconds - how long to wait
	 */
	async waitForPrompt(timeoutMilliseconds = 15_000): Promise<void> {
		await this.waitUntil(`(${readTerminalScript}).trimEnd().endsWith('$')`, timeoutMilliseconds);
	}

	/**
	 * Types a command line into the terminal and presses Enter.
	 * @param commandLine - what to type, e.g. "git status"
	 */
	async typeCommand(commandLine: string): Promise<void> {
		await this.typeText(commandLine);
		await this.pressKey('Enter', 13, '\r');
	}

	/**
	 * Types text into the terminal without pressing Enter.
	 * @param text - what to type, e.g. "i" to start typing in Vim
	 */
	async typeText(text: string): Promise<void> {
		await this.connection.evaluate(`document.querySelector('.xterm-helper-textarea').focus()`);
		await this.connection.send('Input.insertText', { text });
	}

	/**
	 * Reads every visible line of the terminal.
	 * Input: none. Output: the terminal's text, one screen row per line.
	 */
	readTerminal(): Promise<string> {
		return this.connection.evaluate<string>(readTerminalScript);
	}

	/**
	 * Reads the visible text of the first element that matches a CSS selector.
	 * @param selector - e.g. 'section[aria-label="Staging area"]'
	 * @returns its text, or "" when nothing matches
	 */
	readText(selector: string): Promise<string> {
		return this.connection.evaluate<string>(
			`document.querySelector(${JSON.stringify(selector)})?.innerText ?? ''`
		);
	}

	/**
	 * Clicks the first button whose visible text contains the given words.
	 * @param buttonText - part of the button's text, e.g. "Show a hint"
	 */
	async clickButton(buttonText: string): Promise<void> {
		const wasClicked = await this.connection.evaluate<boolean>(`(() => {
			const button = [...document.querySelectorAll('button')]
				.find((candidate) => candidate.innerText.includes(${JSON.stringify(buttonText)}));
			button?.click();
			return button !== undefined;
		})()`);
		if (!wasClicked) {
			throw new Error(`No button with the text "${buttonText}"`);
		}
	}

	/**
	 * Waits until a JavaScript condition in the page is true.
	 * @param condition - JavaScript that evaluates to true or false
	 * @param timeoutMilliseconds - how long to wait before failing
	 * @returns how many milliseconds it took
	 */
	async waitUntil(condition: string, timeoutMilliseconds = 10_000): Promise<number> {
		const startTime = performance.now();
		while (performance.now() - startTime < timeoutMilliseconds) {
			const isTrue = await this.connection.evaluate<boolean>(`Boolean(${condition})`);
			if (isTrue) {
				return performance.now() - startTime;
			}
			await pause(pollIntervalMilliseconds);
		}
		throw new Error(`Timed out after ${timeoutMilliseconds} ms waiting for: ${condition}`);
	}

	/**
	 * Runs any JavaScript in the page, for checks the named actions don't cover.
	 * @param expression - the JavaScript to run
	 * @returns its value
	 */
	evaluate<ValueType>(expression: string): Promise<ValueType> {
		return this.connection.evaluate<ValueType>(expression);
	}

	/**
	 * Makes the web view act as if its window had focus, which the clipboard needs.
	 * Input: none. Output: a promise that ends once it applies.
	 */
	async emulateFocus(): Promise<void> {
		await this.connection.send('Emulation.setFocusEmulationEnabled', { enabled: true });
	}

	/**
	 * Makes the page act as if the window had this size, or goes back to the real size.
	 * @param size - width and height in pixels, or null to stop pretending
	 */
	async emulateWindowSize(size: { width: number; height: number } | null): Promise<void> {
		if (size === null) {
			await this.connection.send('Emulation.clearDeviceMetricsOverride');
			return;
		}
		await this.connection.send('Emulation.setDeviceMetricsOverride', {
			...size,
			deviceScaleFactor: 1,
			mobile: false
		});
	}

	/**
	 * Presses Ctrl plus one key in the terminal, the way a real keyboard does it.
	 * @param key - the key, e.g. "v"
	 * @param code - the physical key's name, e.g. "KeyV" or "Equal"
	 * @param keyCode - its Windows key code, e.g. 86 for V
	 * @param browserCommand - the editing command a real Ctrl key press runs in the web view
	 *                         ("paste" for Ctrl V), unless the page stops it
	 */
	async pressControlKey(
		key: string,
		code: string,
		keyCode: number,
		browserCommand?: string
	): Promise<void> {
		await this.connection.evaluate(`document.querySelector('.xterm-helper-textarea').focus()`);
		const keyDetails = { key, code, windowsVirtualKeyCode: keyCode, modifiers: controlKey };
		const commands = browserCommand === undefined ? [] : [browserCommand];
		await this.connection.send('Input.dispatchKeyEvent', {
			type: 'rawKeyDown',
			...keyDetails,
			commands
		});
		await this.connection.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyDetails });
	}

	/**
	 * Presses and releases a key that types no character, such as Escape or F6.
	 * @param key - the key name, e.g. "Escape"
	 * @param keyCode - its Windows key code, e.g. 27
	 */
	async pressSpecialKey(key: string, keyCode: number): Promise<void> {
		const keyDetails = { key, code: key, windowsVirtualKeyCode: keyCode };
		await this.connection.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', ...keyDetails });
		await this.connection.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyDetails });
	}

	/**
	 * Presses and releases one key, sent to the focused element.
	 * @param key - the key name, e.g. "Enter"
	 * @param keyCode - its Windows key code, e.g. 13
	 * @param text - the character it types, e.g. "\r"
	 */
	private async pressKey(key: string, keyCode: number, text: string): Promise<void> {
		const keyDetails = { key, code: key, windowsVirtualKeyCode: keyCode };
		await this.connection.send('Input.dispatchKeyEvent', { type: 'keyDown', text, ...keyDetails });
		await this.connection.send('Input.dispatchKeyEvent', { type: 'keyUp', ...keyDetails });
	}
}

/** The Chrome DevTools Protocol's flag for "Ctrl is held". */
const controlKey = 2;

/** Page script that reads xterm.js's rows (its DOM renderer draws one div per row). */
const readTerminalScript = `[...document.querySelectorAll('.xterm-rows > div')]
	.map((row) => row.textContent.replaceAll('\\u00a0', ' ').trimEnd())
	.join('\\n')`;
