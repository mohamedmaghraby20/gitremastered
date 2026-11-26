/**
 * check-review-fixes.ts
 * Plays the fixes from the second pilot review in the real desktop app and prints each result:
 * the terminal's share of the practice column (about 55%), even gaps around the desk's commands, paste,
 * Ctrl C still stopping a command, Ctrl + / 0 text size, the mission and quiz headings, and the
 * history map's zoom buttons. Saves a screenshot for a person to look at.
 * Run from app/:  pnpm review:fixes   (build the review copy first: pnpm review:build)
 */

import { writeFileSync } from 'node:fs';
import { DevToolsConnection } from './devtools-connection.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** One check: its name and a function that returns what it found, or throws. */
type ReviewCheck = { name: string; run: (student: StudentActions) => Promise<string> };

/** Page script: the terminal's text size in pixels (xterm.js sets it on its rows). */
const terminalFontSize = `parseFloat(getComputedStyle(document.querySelector('.xterm-rows')).fontSize)`;

const checks: ReviewCheck[] = [
	{ name: 'Terminal takes about 55% of the practice column', run: checkTerminalShare },
	{ name: 'Even gaps around "git add" and "git commit"', run: checkEvenGaps },
	{ name: 'Ctrl V pastes into the terminal', run: checkPaste },
	{ name: 'Ctrl C with nothing selected still stops a command', run: checkInterrupt },
	{ name: 'Ctrl + makes the text bigger, Ctrl 0 resets it', run: checkTextSize },
	{ name: 'Mission and quiz have their own headings', run: checkHeadings },
	{ name: 'History map zooms out with its button', run: checkZoomOut }
];

/**
 * Measures the terminal's height against the practice column's.
 * @param student - the student actions
 * @returns the share, e.g. "41% of 852 px"
 */
async function checkTerminalShare(student: StudentActions): Promise<string> {
	const share = await student.evaluate<{ percent: number; columnHeight: number }>(`(() => {
		const column = document.querySelector('section[aria-label="Practice"]').getBoundingClientRect();
		const terminal = document.querySelector('section[aria-label="Terminal"]').getBoundingClientRect();
		return { percent: Math.round((terminal.height / column.height) * 100), columnHeight: Math.round(column.height) };
	})()`);
	if (share.percent < 50 || share.percent > 60) {
		throw new Error(`terminal is ${share.percent}% of the column`);
	}
	return `${share.percent}% of ${share.columnHeight} px`;
}

/**
 * Measures the space left and right of each command (keycap and arrow) between the desk's zones.
 * @param student - the student actions
 * @returns the four gaps in pixels
 */
async function checkEvenGaps(student: StudentActions): Promise<string> {
	const gaps = await student.evaluate<number[]>(`(() => {
		const zones = ['Working tree', 'Staging area', 'Repository']
			.map((name) => document.querySelector('section[aria-label="' + name + '"]').getBoundingClientRect());
		const commands = [...document.querySelectorAll('#files-desk div[aria-hidden="true"]')]
			.map((command) => ({
				left: command.firstElementChild.getBoundingClientRect().left,
				right: command.lastElementChild.getBoundingClientRect().right
			}));
		return [
			commands[0].left - zones[0].right, zones[1].left - commands[0].right,
			commands[1].left - zones[1].right, zones[2].left - commands[1].right
		].map(Math.round);
	})()`);
	if (Math.max(...gaps) - Math.min(...gaps) > 2) {
		throw new Error(`gaps differ: ${gaps.join(', ')} px`);
	}
	return `${gaps.join(', ')} px`;
}

/**
 * Puts a command on the clipboard, pastes it with Ctrl V and runs it.
 * @param student - the student actions
 * @returns what the shell printed
 */
async function checkPaste(student: StudentActions): Promise<string> {
	// The clipboard only accepts text from a focused page; a window started by a script is not
	// focused, so the check asks the web view to behave as if it were.
	await student.emulateFocus();
	await student.evaluate(`navigator.clipboard.writeText('echo pasted-$((40 + 2))')`);
	await student.pressControlKey('v', 'KeyV', 86, 'paste');
	await student.typeCommand('');
	await student.waitUntil(
		`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.trim() === 'pasted-42')`
	);
	return 'the pasted command ran and printed "pasted-42"';
}

/**
 * Starts a long command and stops it with Ctrl C.
 * @param student - the student actions
 * @returns how long the stop took
 */
async function checkInterrupt(student: StudentActions): Promise<string> {
	await student.typeCommand('sleep 30');
	await pause(500);
	await student.pressControlKey('c', 'KeyC', 67);
	// "sleep 30" would hold the prompt for 30 s; the prompt coming back sooner means it stopped.
	const startTime = performance.now();
	await student.waitForPrompt(5_000);
	return `prompt back after ${Math.round(performance.now() - startTime)} ms`;
}

/**
 * Makes the text two steps bigger, then resets it.
 * @param student - the student actions
 * @returns the sizes before, after and after reset
 */
async function checkTextSize(student: StudentActions): Promise<string> {
	const before = await student.evaluate<number>(terminalFontSize);
	await student.pressControlKey('=', 'Equal', 187);
	await student.pressControlKey('=', 'Equal', 187);
	await student.waitUntil(`${terminalFontSize} === ${before + 2}`);
	await student.pressControlKey('0', 'Digit0', 48);
	await student.waitUntil(`${terminalFontSize} === ${before}`);
	return `${before} px → ${before + 2} px → ${before} px`;
}

/**
 * Reads the mission and quiz headings.
 * @param student - the student actions
 * @returns both headings
 */
async function checkHeadings(student: StudentActions): Promise<string> {
	const mission = await student.readText('#mission-heading');
	const quiz = await student.readText('#quiz-heading');
	if (mission === '' || quiz === '') {
		throw new Error('a heading is missing');
	}
	return `"${mission}" and "${quiz}"`;
}

/**
 * Clicks the map's zoom-out button and checks the map got smaller.
 * @param student - the student actions
 * @returns the zoom before and after
 */
async function checkZoomOut(student: StudentActions): Promise<string> {
	const mapZoom = `new DOMMatrix(getComputedStyle(document.querySelector('.svelte-flow__viewport')).transform).a`;
	const before = await student.evaluate<number>(mapZoom);
	await student.evaluate(`document.querySelector('.svelte-flow__controls-zoomout').click()`);
	await student.waitUntil(`${mapZoom} < ${before}`);
	const after = await student.evaluate<number>(mapZoom);
	return `zoom ${before.toFixed(2)} → ${after.toFixed(2)}`;
}

/**
 * Saves a screenshot of the window.
 * @param connection - the remote-control connection
 * @param filePath - where to write the PNG
 */
async function saveScreenshot(connection: DevToolsConnection, filePath: string): Promise<void> {
	const shot = (await connection.send('Page.captureScreenshot', { format: 'png' })) as {
		data: string;
	};
	writeFileSync(filePath, Buffer.from(shot.data, 'base64'));
}

/**
 * Runs every check in order and prints ✓ or ✗ for each.
 * Input: an optional screenshot path as the first command-line argument.
 * Output: none; it exits with code 1 if any check failed.
 */
async function checkReviewFixes(): Promise<void> {
	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	let failedCount = 0;
	try {
		const student = new StudentActions(connection);
		await student.openLesson('three-areas');
		await student.waitForPrompt();
		for (const check of checks) {
			try {
				console.log(`✓ ${check.name}: ${await check.run(student)}`);
			} catch (error) {
				failedCount += 1;
				console.log(`✗ ${check.name}: ${String(error)}`);
			}
		}
		const screenshotPath = process.argv[2];
		if (screenshotPath !== undefined) {
			await saveScreenshot(connection, screenshotPath);
		}
	} finally {
		connection.close();
		await stopReviewApp(appProcess);
	}
	process.exitCode = failedCount === 0 ? 0 : 1;
}

checkReviewFixes().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
