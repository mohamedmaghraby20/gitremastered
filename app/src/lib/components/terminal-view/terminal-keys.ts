/**
 * terminal-keys.ts
 * The terminal's own keyboard shortcuts, as pure functions (no xterm.js, no screen code):
 *   Esc               leave the terminal
 *   Ctrl V            paste (Windows and Linux; macOS already pastes with Cmd V)
 *   Ctrl C            copy, but only while text is selected; otherwise it stops the command
 *   Ctrl + / − / 0    bigger, smaller, or default text size
 * Ctrl Shift C and Ctrl Shift V work too, as in most Linux terminals.
 */

/** What a key press asks the terminal to do. */
export type TerminalShortcut =
	'leave' | 'paste' | 'copy' | 'larger-text' | 'smaller-text' | 'default-text';

/** The shortcuts that change the text size. */
export type TextSizeShortcut = Extract<
	TerminalShortcut,
	'larger-text' | 'smaller-text' | 'default-text'
>;

/** The parts of a key press the shortcuts look at (a KeyboardEvent has them all). */
export type TerminalKeyPress = Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>;

/** The smallest and largest terminal text size, in pixels. */
export const smallestFontSize = 10;
export const largestFontSize = 24;

/** Keys that make the text bigger: "=" is the "+" key without Shift on most keyboards. */
const largerTextKeys = ['+', '='];

/** Keys that make the text smaller (the main "-" key and the number pad's). */
const smallerTextKeys = ['-', '_'];

/**
 * Finds which terminal shortcut a key press is, if any.
 * @param keyPress - the key press
 * @param hasSelection - true while text is selected in the terminal (decides what Ctrl C does)
 * @returns the shortcut, or null when the key should go to the shell as usual
 */
export function findTerminalShortcut(
	keyPress: TerminalKeyPress,
	hasSelection: boolean
): TerminalShortcut | null {
	if (keyPress.key === 'Escape') {
		return 'leave';
	}
	if (!keyPress.ctrlKey || keyPress.altKey || keyPress.metaKey) {
		return null;
	}
	return findControlShortcut(keyPress.key.toLowerCase(), hasSelection);
}

/**
 * Finds the shortcut for a key pressed together with Ctrl.
 * @param key - the key, in lower case
 * @param hasSelection - true while text is selected in the terminal
 * @returns the shortcut, or null (for example Ctrl C with nothing selected, which stops a command)
 */
function findControlShortcut(key: string, hasSelection: boolean): TerminalShortcut | null {
	if (key === 'v') {
		return 'paste';
	}
	if (key === 'c' && hasSelection) {
		return 'copy';
	}
	if (largerTextKeys.includes(key)) {
		return 'larger-text';
	}
	if (smallerTextKeys.includes(key)) {
		return 'smaller-text';
	}
	if (key === '0') {
		return 'default-text';
	}
	return null;
}

/**
 * Works out the new text size after a text-size shortcut, kept between the smallest and largest.
 * @param currentSize - the size now, in pixels
 * @param shortcut - "larger-text", "smaller-text" or "default-text"
 * @param defaultSize - the size from the design tokens
 * @returns the new size in pixels
 */
export function nextFontSize(
	currentSize: number,
	shortcut: TextSizeShortcut,
	defaultSize: number
): number {
	if (shortcut === 'default-text') {
		return defaultSize;
	}
	const step = shortcut === 'larger-text' ? 1 : -1;
	return Math.min(largestFontSize, Math.max(smallestFontSize, currentSize + step));
}
