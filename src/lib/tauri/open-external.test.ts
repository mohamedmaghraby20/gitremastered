/**
 * open-external.test.ts
 * Tests for opening web links outside the app: only https:// links may open,
 * and in the desktop app a link click goes to the system browser instead of the app window.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isTauri } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { handleExternalLinkClick, isSafeExternalLink, openExternalLink } from './open-external';

// Tests run outside the app window, so the Tauri parts are replaced by mocks.
vi.mock('@tauri-apps/api/core', () => ({ isTauri: vi.fn() }));
vi.mock('@tauri-apps/plugin-opener', () => ({ openUrl: vi.fn() }));

const mockedIsTauri = vi.mocked(isTauri);
const mockedOpenUrl = vi.mocked(openUrl);

const bookAddress = 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository';

beforeEach(() => {
	mockedIsTauri.mockReset();
	mockedOpenUrl.mockReset();
	mockedOpenUrl.mockResolvedValue(undefined);
});

describe('isSafeExternalLink', () => {
	it('accepts https links', () => {
		expect(isSafeExternalLink(bookAddress)).toBe(true);
	});

	it('refuses other schemes and broken addresses', () => {
		expect(isSafeExternalLink('http://git-scm.com/book')).toBe(false);
		expect(isSafeExternalLink('file:///C:/Windows/System32/calc.exe')).toBe(false);
		expect(isSafeExternalLink('javascript:alert(1)')).toBe(false);
		expect(isSafeExternalLink('not a link')).toBe(false);
	});
});

describe('openExternalLink', () => {
	it('opens an https link in the system browser', async () => {
		await openExternalLink(bookAddress);

		expect(mockedOpenUrl).toHaveBeenCalledWith(bookAddress);
	});

	it('refuses anything that is not https and opens nothing', async () => {
		await expect(openExternalLink('file:///C:/secret.txt')).rejects.toThrow(
			'Only https:// links can be opened'
		);
		expect(mockedOpenUrl).not.toHaveBeenCalled();
	});
});

describe('handleExternalLinkClick', () => {
	it('in the desktop app, stops the click and opens the system browser', () => {
		mockedIsTauri.mockReturnValue(true);
		const click = new Event('click', { cancelable: true });

		handleExternalLinkClick(click, bookAddress);

		expect(click.defaultPrevented).toBe(true);
		expect(mockedOpenUrl).toHaveBeenCalledWith(bookAddress);
	});

	it('in a normal browser, leaves the link alone', () => {
		mockedIsTauri.mockReturnValue(false);
		const click = new Event('click', { cancelable: true });

		handleExternalLinkClick(click, bookAddress);

		expect(click.defaultPrevented).toBe(false);
		expect(mockedOpenUrl).not.toHaveBeenCalled();
	});
});
