/**
 * page-title.test.ts
 * Tests for buildPageTitle, which writes the text shown in the window's title bar.
 */

import { describe, expect, it } from 'vitest';
import { appName, buildPageTitle } from './page-title';

describe('buildPageTitle', () => {
	it('shows only the app name on the home page', () => {
		expect(buildPageTitle()).toBe('GitRemastered');
	});

	it('puts the page name before the app name', () => {
		expect(buildPageTitle('Course map')).toBe('Course map · GitRemastered');
	});

	it('ignores a page name that is only spaces', () => {
		expect(buildPageTitle('   ')).toBe(appName);
	});
});
