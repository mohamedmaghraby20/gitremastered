/**
 * keyboard-shortcuts.test.ts
 * Tests for recognising the app's keyboard shortcuts.
 */

import { describe, expect, it } from 'vitest';
import { isSearchShortcut, type ShortcutKeyEvent } from './keyboard-shortcuts';

/**
 * Builds a key press with no modifier keys held, then applies the given changes.
 * @param changes - the parts of the key press to change, like { key: 'k', ctrlKey: true }
 * @returns a key press description
 */
function keyPress(changes: Partial<ShortcutKeyEvent>): ShortcutKeyEvent {
	return { key: '', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...changes };
}

describe('isSearchShortcut', () => {
	it('accepts Ctrl+K (Windows and Linux)', () => {
		expect(isSearchShortcut(keyPress({ key: 'k', ctrlKey: true }))).toBe(true);
	});

	it('accepts Cmd+K (macOS)', () => {
		expect(isSearchShortcut(keyPress({ key: 'k', metaKey: true }))).toBe(true);
	});

	it('accepts a capital K, in case Caps Lock is on', () => {
		expect(isSearchShortcut(keyPress({ key: 'K', ctrlKey: true }))).toBe(true);
	});

	it('ignores K on its own, so typing the letter still works', () => {
		expect(isSearchShortcut(keyPress({ key: 'k' }))).toBe(false);
	});

	it('ignores Ctrl+Shift+K and Ctrl+Alt+K', () => {
		expect(isSearchShortcut(keyPress({ key: 'k', ctrlKey: true, shiftKey: true }))).toBe(false);
		expect(isSearchShortcut(keyPress({ key: 'k', ctrlKey: true, altKey: true }))).toBe(false);
	});
});
