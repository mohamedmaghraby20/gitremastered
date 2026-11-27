/**
 * theme.test.ts
 * Tests for the theme helper that switches between light, dark and the system setting.
 */

import { describe, expect, it } from 'vitest';
import { applyTheme, readAppliedTheme, type ThemeTarget } from './theme';

/**
 * Makes a stand-in for the <html> element that only remembers its attributes.
 * Inputs: none. Output: an object with the same attribute methods as an element.
 */
function createFakeRootElement(): ThemeTarget {
	const attributes = new Map<string, string>();
	return {
		getAttribute: (name) => attributes.get(name) ?? null,
		setAttribute: (name, value) => {
			attributes.set(name, value);
		},
		removeAttribute: (name) => {
			attributes.delete(name);
		}
	};
}

describe('applyTheme', () => {
	it('sets data-theme to dark for the dark theme', () => {
		const rootElement = createFakeRootElement();
		applyTheme('dark', rootElement);
		expect(rootElement.getAttribute('data-theme')).toBe('dark');
	});

	it('sets data-theme to light for the light theme', () => {
		const rootElement = createFakeRootElement();
		applyTheme('light', rootElement);
		expect(rootElement.getAttribute('data-theme')).toBe('light');
	});

	it('removes data-theme for the system setting, so the CSS follows the computer', () => {
		const rootElement = createFakeRootElement();
		applyTheme('dark', rootElement);
		applyTheme('system', rootElement);
		expect(rootElement.getAttribute('data-theme')).toBeNull();
	});
});

describe('readAppliedTheme', () => {
	it('reads back the theme that was applied', () => {
		const rootElement = createFakeRootElement();
		applyTheme('dark', rootElement);
		expect(readAppliedTheme(rootElement)).toBe('dark');
	});

	it('reports system when no theme is set or the value is unknown', () => {
		const rootElement = createFakeRootElement();
		expect(readAppliedTheme(rootElement)).toBe('system');
		rootElement.setAttribute('data-theme', 'purple');
		expect(readAppliedTheme(rootElement)).toBe('system');
	});
});
