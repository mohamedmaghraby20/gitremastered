/**
 * terminal-keys.test.ts
 * Tests the terminal's keyboard shortcuts and the text-size steps.
 */

import { describe, expect, it } from 'vitest';
import {
	findTerminalShortcut,
	largestFontSize,
	nextFontSize,
	smallestFontSize,
	type TerminalKeyPress
} from './terminal-keys';

/**
 * Builds a key press with no modifier keys, then applies the given changes.
 * @param changes - the parts to change, like { key: 'v', ctrlKey: true }
 * @returns the key press
 */
function keyPress(changes: Partial<TerminalKeyPress>): TerminalKeyPress {
	return { key: '', ctrlKey: false, metaKey: false, altKey: false, ...changes };
}

describe('findTerminalShortcut', () => {
	it('leaves the terminal on F6', () => {
		expect(findTerminalShortcut(keyPress({ key: 'F6' }), false)).toBe('leave');
	});

	it('sends Esc to the shell, because Vim needs it', () => {
		expect(findTerminalShortcut(keyPress({ key: 'Escape' }), false)).toBeNull();
	});

	it('pastes on Ctrl V and Ctrl Shift V', () => {
		expect(findTerminalShortcut(keyPress({ key: 'v', ctrlKey: true }), false)).toBe('paste');
		expect(findTerminalShortcut(keyPress({ key: 'V', ctrlKey: true }), false)).toBe('paste');
	});

	it('copies on Ctrl C only while text is selected', () => {
		expect(findTerminalShortcut(keyPress({ key: 'c', ctrlKey: true }), true)).toBe('copy');
		expect(findTerminalShortcut(keyPress({ key: 'c', ctrlKey: true }), false)).toBeNull();
	});

	it('changes the text size on Ctrl +, Ctrl - and Ctrl 0', () => {
		expect(findTerminalShortcut(keyPress({ key: '=', ctrlKey: true }), false)).toBe('larger-text');
		expect(findTerminalShortcut(keyPress({ key: '+', ctrlKey: true }), false)).toBe('larger-text');
		expect(findTerminalShortcut(keyPress({ key: '-', ctrlKey: true }), false)).toBe('smaller-text');
		expect(findTerminalShortcut(keyPress({ key: '0', ctrlKey: true }), false)).toBe('default-text');
	});

	it('sends ordinary keys and other Ctrl keys to the shell', () => {
		expect(findTerminalShortcut(keyPress({ key: 'v' }), false)).toBeNull();
		expect(findTerminalShortcut(keyPress({ key: 'd', ctrlKey: true }), false)).toBeNull();
		expect(
			findTerminalShortcut(keyPress({ key: 'v', ctrlKey: true, altKey: true }), false)
		).toBeNull();
	});
});

describe('nextFontSize', () => {
	it('steps one pixel up or down', () => {
		expect(nextFontSize(14, 'larger-text', 14)).toBe(15);
		expect(nextFontSize(14, 'smaller-text', 14)).toBe(13);
	});

	it('goes back to the default size', () => {
		expect(nextFontSize(20, 'default-text', 14)).toBe(14);
	});

	it('stays between the smallest and largest size', () => {
		expect(nextFontSize(largestFontSize, 'larger-text', 14)).toBe(largestFontSize);
		expect(nextFontSize(smallestFontSize, 'smaller-text', 14)).toBe(smallestFontSize);
	});
});
