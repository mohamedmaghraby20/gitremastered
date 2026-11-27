/**
 * review-app.ts
 * Starts and stops the "review copy" of the desktop app for the student driver.
 * The review copy is a release build with its own identifier, so its progress file,
 * practice folders and web view data live apart from your own copy of the app.
 * Build it once with:
 *   pnpm review:build   (then: pnpm review:terminal, review:measure or review:play)
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** The port the web view listens on for remote control. */
export const debuggingPort = 9333;

/** Where the release build puts the program. */
const programPath = fileURLToPath(
	new URL('../../src-tauri/target/release/gitremastered.exe', import.meta.url)
);

/** How long to wait for the window to come up before giving up. */
const startupTimeoutMilliseconds = 30_000;

/**
 * Starts the review copy with remote debugging on, and waits until it answers.
 * Input: none. Output: the running program, to pass to stopReviewApp later.
 */
export async function startReviewApp(): Promise<ChildProcess> {
	if (!existsSync(programPath)) {
		throw new Error(`No release build at ${programPath}. Build it first (see review-app.ts).`);
	}
	const appProcess = spawn(programPath, [], {
		env: {
			...process.env,
			WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: `--remote-debugging-port=${debuggingPort}`
		},
		stdio: 'ignore'
	});
	await waitForDebuggingPort();
	return appProcess;
}

/**
 * Closes the review copy and waits for it to exit.
 * @param appProcess - the program startReviewApp returned
 */
export async function stopReviewApp(appProcess: ChildProcess): Promise<void> {
	if (appProcess.exitCode !== null) {
		return;
	}
	const exited = new Promise<void>((resolve) => appProcess.once('exit', () => resolve()));
	appProcess.kill();
	await exited;
}

/**
 * Polls the debugging port until the web view lists a page, or the timeout passes.
 * Input: none. Output: a promise that ends when the app is ready.
 */
async function waitForDebuggingPort(): Promise<void> {
	const deadline = Date.now() + startupTimeoutMilliseconds;
	while (Date.now() < deadline) {
		if (await isPageListed()) {
			return;
		}
		await pause(250);
	}
	throw new Error('The review copy did not open its debugging port in time');
}

/**
 * Checks once whether the web view already lists a page.
 * Input: none. Output: true when a page is ready for remote control.
 */
async function isPageListed(): Promise<boolean> {
	try {
		const response = await fetch(`http://127.0.0.1:${debuggingPort}/json`);
		const targets = (await response.json()) as { type: string }[];
		return targets.some((target) => target.type === 'page');
	} catch {
		return false;
	}
}

/**
 * Waits for a number of milliseconds.
 * @param milliseconds - how long to wait
 */
export function pause(milliseconds: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
