/**
 * navigation-links.test.ts
 * Tests for the app's main links and for deciding which link is the current page.
 */

import { describe, expect, it } from 'vitest';
import { isLinkActive, mainLinks } from './navigation-links';

describe('mainLinks', () => {
	it('lists Home, Course map, Command index and Settings, in that order', () => {
		const labels = mainLinks.map((link) => link.label);
		expect(labels).toEqual(['Home', 'Course map', 'Command index', 'Settings']);
	});
});

describe('isLinkActive', () => {
	it('marks Home only on the home page itself', () => {
		expect(isLinkActive('/', '/')).toBe(true);
		expect(isLinkActive('/settings', '/')).toBe(false);
	});

	it('marks a link on its own page', () => {
		expect(isLinkActive('/settings', '/settings')).toBe(true);
	});

	it('marks a link on the pages inside it', () => {
		expect(isLinkActive('/course-map/book-path', '/course-map')).toBe(true);
	});

	it('does not mark a link whose name only starts the same way', () => {
		expect(isLinkActive('/settings-old', '/settings')).toBe(false);
	});
});
