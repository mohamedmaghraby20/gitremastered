/**
 * keyboard-shortcuts.ts
 * Recognises the app's keyboard shortcuts from a key press.
 */

/** The parts of a key press the shortcuts look at (a real KeyboardEvent has all of them). */
export type ShortcutKeyEvent = Pick<
	KeyboardEvent,
	'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'
>;

/**
 * Checks for the "open search" shortcut: Ctrl+K, or Cmd+K on macOS.
 * @param keyEvent - the key press
 * @returns true if the key press is the search shortcut
 */
export function isSearchShortcut(keyEvent: ShortcutKeyEvent): boolean {
	const isLetterK = keyEvent.key.toLowerCase() === 'k';
	const holdsCommandKey = keyEvent.ctrlKey || keyEvent.metaKey;
	const holdsOtherModifier = keyEvent.altKey || keyEvent.shiftKey;
	return isLetterK && holdsCommandKey && !holdsOtherModifier;
}
