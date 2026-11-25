/**
 * theme.ts
 * Switches the app between the light theme, the dark theme and the computer's own setting.
 *
 * How it works: tokens.css holds both themes' colors. This helper only sets one attribute on
 * the <html> element, data-theme="light" or "dark" (or removes it for "system"), and every
 * color in the app changes in one step. Saving the choice comes later (task 21).
 */

/** The three choices a student can make in Settings. */
export type ThemeChoice = 'light' | 'dark' | 'system';

/** The parts of an HTML element the helper uses (lets tests pass a simple stand-in). */
export type ThemeTarget = Pick<Element, 'getAttribute' | 'setAttribute' | 'removeAttribute'>;

/** Every choice, in the order Settings shows them. */
export const themeChoices: readonly ThemeChoice[] = ['light', 'dark', 'system'];

const themeAttribute = 'data-theme';

/**
 * Applies a theme choice.
 * @param themeChoice - "light", "dark" or "system"
 * @param rootElement - the element to mark; the <html> element in the app
 * @returns nothing
 */
export function applyTheme(
	themeChoice: ThemeChoice,
	rootElement: ThemeTarget = document.documentElement
): void {
	if (themeChoice === 'system') {
		rootElement.removeAttribute(themeAttribute);
		return;
	}
	rootElement.setAttribute(themeAttribute, themeChoice);
}

/**
 * Reads which theme is applied right now.
 * @param rootElement - the element to read; the <html> element in the app
 * @returns "light" or "dark" if one is set, otherwise "system"
 */
export function readAppliedTheme(rootElement: ThemeTarget = document.documentElement): ThemeChoice {
	const attributeValue = rootElement.getAttribute(themeAttribute);
	if (attributeValue === 'light' || attributeValue === 'dark') {
		return attributeValue;
	}
	return 'system';
}
