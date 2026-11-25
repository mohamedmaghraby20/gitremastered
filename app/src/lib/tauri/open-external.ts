/**
 * open-external.ts
 * Opens web links (like the Pro Git citation) in the student's own browser.
 * Inside the desktop window a normal link would try to load the page in the app itself,
 * so in the desktop app we hand the link to the system browser through Tauri's opener plugin.
 * Only https:// links are allowed, so lesson content can never open files or programs.
 */

import { isTauri } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';

/**
 * Checks that an address is a well-formed https:// link.
 * Input: address, any text. Output: true only for a valid https:// URL.
 */
export function isSafeExternalLink(address: string): boolean {
	if (!URL.canParse(address)) {
		return false;
	}
	const parsedAddress = new URL(address);
	return parsedAddress.protocol === 'https:';
}

/**
 * Opens an https:// link in the system browser.
 * Input: address, the link to open. Output: a promise that ends once the browser was asked;
 * it rejects with an Error when the address is not a safe https:// link.
 */
export async function openExternalLink(address: string): Promise<void> {
	if (!isSafeExternalLink(address)) {
		throw new Error(`Only https:// links can be opened: ${address}`);
	}
	await openUrl(address);
}

/**
 * Click handler for links that leave the app.
 * In the desktop app it cancels the click and opens the system browser instead;
 * in a normal browser it does nothing, so the link opens a new tab as usual.
 * Inputs: event, the click; address, the link's address. Output: none.
 */
export function handleExternalLinkClick(event: Event, address: string): void {
	if (!isTauri()) {
		return;
	}
	event.preventDefault();
	openExternalLink(address).catch((error: unknown) => {
		console.error('Could not open the link in the system browser:', error);
	});
}
