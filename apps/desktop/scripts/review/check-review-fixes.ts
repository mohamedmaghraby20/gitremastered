/**
 * check-review-fixes.ts
 * Plays the fixes from the second pilot review in the real desktop app and prints each result:
 * the terminal's share of the practice column (about 55%), even gaps around the desk's commands, paste,
 * Ctrl C still stopping a command, Ctrl + / 0 text size, the challenge and quiz headings, and the
 * history map's zoom buttons, Esc reaching Vim for a commit message, F6 leaving the terminal,
 * the small-window layout at 1024 × 700, the resize handle, a long history, and starting a
 * challenge. Saves a screenshot for a person to look at.
 * Run from the repository root:  pnpm review:fixes   (build the review copy first: pnpm review:build)
 */

import { writeFileSync } from 'node:fs';
import { DevToolsConnection } from './devtools-connection.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** One check: its name and a function that returns what it found, or throws. */
type ReviewCheck = { name: string; run: (student: StudentActions) => Promise<string> };

/** Page script: focuses the chosen option of the small-window Visualizer / Terminal switch. */
const focusChosenToolScript = `document.querySelector('[aria-label="Practice tool"] [role=radio][aria-checked=true]').focus()`;

/** Page script: do the desk zones fit the board, and does the page avoid sideways scrolling? */
const smallWindowLayoutScript = `(() => {
	const board = document.querySelector('.visualizer-board').getBoundingClientRect();
	const zonesFit = ['Working tree', 'Staging area', 'Repository']
		.map((name) => document.querySelector('section[aria-label="' + name + '"]').getBoundingClientRect())
		.every((zone) => zone.left >= board.left - 0.5 && zone.right <= board.right + 0.5);
	const noSidewaysScroll = document.documentElement.scrollWidth <= innerWidth;
	return {
		fits: zonesFit && noSidewaysScroll,
		lessonWidth: Math.round(document.querySelector('article').getBoundingClientRect().width),
		practiceWidth: Math.round(document.querySelector('section[aria-label="Practice"]').getBoundingClientRect().width)
	};
})()`;

/** Page script: is the station of the newest commit ("Step 22") inside the small map's view? */
const newestStationInViewScript = `(() => {
	const map = document.querySelector('section[aria-label="History"] .svelte-flow')?.getBoundingClientRect();
	const station = [...document.querySelectorAll('section[aria-label="History"] .svelte-flow__node')]
		.find((node) => node.textContent.includes('Step 22'))?.getBoundingClientRect();
	return map !== undefined && station !== undefined && station.left >= map.left && station.right <= map.right;
})()`;

/**
 * Page script: clicks the start button of the challenge card with this title (if it has one:
 * the active challenge has none, so starting it again is skipped).
 * @param title - the challenge's title, e.g. "Two changes, two commits"
 * @returns the script
 */
function startChallengeScript(title: string): string {
	return `[...document.querySelectorAll('section[aria-labelledby="challenges-heading"] li')]
		.find((card) => card.querySelector('h3')?.textContent.trim() === ${JSON.stringify(title)})
		?.querySelector('button')?.click()`;
}

/** Page script: the terminal's text size in pixels (xterm.js sets it on its rows). */
const terminalFontSize = `parseFloat(getComputedStyle(document.querySelector('.xterm-rows')).fontSize)`;

const checks: ReviewCheck[] = [
	{ name: 'Terminal takes about 55% of the practice column', run: checkTerminalShare },
	{ name: 'Even gaps around "git add" and "git commit"', run: checkEvenGaps },
	{ name: 'Ctrl V pastes into the terminal', run: checkPaste },
	{ name: 'Ctrl C with nothing selected still stops a command', run: checkInterrupt },
	{ name: 'Ctrl + makes the text bigger, Ctrl 0 resets it', run: checkTextSize },
	{ name: 'Challenge and quiz have their own headings', run: checkHeadings },
	{ name: 'History map zooms out with its button', run: checkZoomOut },
	// Before the window-size checks: resizing reflows the long prompt badly (review finding 4).
	{
		name: 'History follows HEAD after 22 commits; Expand opens and Esc closes',
		run: checkLongHistory
	},
	{ name: 'Esc reaches Vim: a commit message written in the editor', run: checkVimCommit },
	{ name: 'F6 moves focus out of the terminal', run: checkLeaveTerminal },
	{ name: 'Small window (1024 × 700): one practice panel, nothing cut off', run: checkSmallWindow },
	{ name: 'Column handle resizes by keyboard and resets', run: checkColumnHandle },
	{ name: 'Starting a challenge rebuilds the practice project for it', run: checkStartChallenge }
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
				// The last visible child: the → arrow (the ↓ arrow is hidden while the zones sit side by side).
				right: Math.max(...[...command.children].map((child) => child.getBoundingClientRect().right))
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
 * Reads the challenge and quiz headings.
 * @param student - the student actions
 * @returns both headings
 */
async function checkHeadings(student: StudentActions): Promise<string> {
	const challenge = await student.readText('#challenges-heading');
	const quiz = await student.readText('#quiz-heading');
	if (challenge === '' || quiz === '') {
		throw new Error('a heading is missing');
	}
	return `"${challenge}" and "${quiz}"`;
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
 * Commits a scratch file through Vim, as the lesson teaches: git commit, i, the message, Esc, :wq.
 * Uses its own file, so the practice folder's files stay as they are.
 * @param student - the student actions
 * @returns the message Git saved
 */
async function checkVimCommit(student: StudentActions): Promise<string> {
	/*
	 * Start from a fresh prompt: right after an interrupted command (the Ctrl C check), the first
	 * key typed can be lost while bash redraws its long prompt (review finding 4).
	 */
	await student.typeCommand('');
	await student.waitForPrompt();
	// The shell prints "staged-2" only after git add has finished (the typed line shows $((1+1))).
	await student.typeCommand(
		'echo "check $RANDOM" > vim-check.txt && git add vim-check.txt && echo staged-$((1+1))'
	);
	await student.waitUntil(
		`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.trim() === 'staged-2')`
	);
	await student.typeCommand('git commit');
	await student.waitUntil(
		`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.includes('Please enter the commit message'))`
	);
	await student.typeText('iWritten in Vim');
	await student.pressSpecialKey('Escape', 27);
	await student.typeCommand(':wq');
	await student.waitForPrompt();
	// A fresh prompt again: the first key after Vim closes can be lost too (finding 4).
	await student.typeCommand('');
	await student.waitForPrompt();
	await student.typeCommand('git log -1 --format=saved:%s');
	await student.waitUntil(
		`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.includes('saved:Written in Vim'))`
	);
	return 'Git saved the commit "Written in Vim"';
}

/**
 * Presses F6 in the terminal and checks the keyboard focus left it.
 * @param student - the student actions
 * @returns where the focus went
 */
async function checkLeaveTerminal(student: StudentActions): Promise<string> {
	await student.evaluate(`document.querySelector('.xterm-helper-textarea').focus()`);
	await student.pressSpecialKey('F6', 117);
	await student.waitUntil(`!document.querySelector('.xterm').contains(document.activeElement)`);
	return `focus moved to the ${await student.evaluate<string>('document.activeElement.tagName.toLowerCase()')} around the terminal`;
}

/**
 * Shrinks the page to the smallest window (1024 × 700), switches the practice panel to the
 * visualizer by keyboard, and checks the columns fit and the desk is not cut off.
 * @param student - the student actions
 * @returns the column widths
 */
async function checkSmallWindow(student: StudentActions): Promise<string> {
	await student.emulateWindowSize({ width: 1024, height: 700 });
	try {
		await student.waitUntil(focusChosenToolScript.replace('.focus()', '.offsetParent !== null'));
		await student.evaluate(focusChosenToolScript);
		await student.pressSpecialKey('ArrowLeft', 37);
		await student.waitUntil(
			`document.querySelector('.visualizer-board').getBoundingClientRect().height > 200`
		);
		const layout = await student.evaluate<{
			fits: boolean;
			lessonWidth: number;
			practiceWidth: number;
		}>(smallWindowLayoutScript);
		if (!layout.fits) {
			throw new Error('something is cut off or the page scrolls sideways');
		}
		await student.evaluate(focusChosenToolScript);
		await student.pressSpecialKey('ArrowRight', 39);
		return `lesson ${layout.lessonWidth} px and practice ${layout.practiceWidth} px side by side; the desk fits`;
	} finally {
		await student.emulateWindowSize(null);
	}
}

/**
 * Moves the handle between the lesson and practice columns with the keyboard, checks the
 * lesson column grew, then double-clicks it back to the default (so later runs start clean).
 * @param student - the student actions
 * @returns the widths before, after and after reset
 */
async function checkColumnHandle(student: StudentActions): Promise<string> {
	const lessonWidth = `Math.round(document.querySelector('article').getBoundingClientRect().width)`;
	const resetHandle = `document.querySelector('[role=separator]').dispatchEvent(new MouseEvent('dblclick', { bubbles: true }))`;
	// Start from the default widths, whatever an earlier run saved.
	await student.evaluate(resetHandle);
	await pause(300);
	const before = await student.evaluate<number>(lessonWidth);
	await student.evaluate(`document.querySelector('[role=separator]').focus()`);
	for (let pressCount = 0; pressCount < 5; pressCount += 1) {
		await student.pressSpecialKey('ArrowRight', 39);
	}
	await student.waitUntil(`${lessonWidth} > ${before + 40}`);
	const after = await student.evaluate<number>(lessonWidth);
	await student.evaluate(resetHandle);
	await student.waitUntil(`Math.abs(${lessonWidth} - ${before}) <= 1`);
	// Give the saved reset a moment to reach the disk before the app closes.
	await pause(500);
	return `${before} px → ${after} px → ${before} px after double-click`;
}

/**
 * Makes 22 commits in the terminal, checks the newest station is inside the map's view,
 * opens the large map and closes it with Esc, then resets the practice project.
 * @param student - the student actions
 * @returns what was seen
 */
async function checkLongHistory(student: StudentActions): Promise<string> {
	// Clear the terminal first: q leaves a pager (like git log's) if one is open, Ctrl C drops a
	// half-typed line (see finding 4), and an empty Enter gives a fresh prompt.
	await student.typeText('q');
	await student.pressControlKey('c', 'KeyC', 67);
	await student.typeCommand('');
	await student.waitForPrompt();
	await student.typeCommand(
		'git --no-pager log -1 >/dev/null; for step in $(seq 1 22); do echo $step > step.txt && git add step.txt && git commit -q -m "Step $step"; done; echo made-$((20+2))'
	);
	await student.waitUntil(
		`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.trim() === 'made-22')`,
		30_000
	);
	await student.waitUntil(newestStationInViewScript, 10_000);
	await student.evaluate(
		`[...document.querySelectorAll('button')].find((button) => button.textContent.includes('Expand')).click()`
	);
	await student.waitUntil(`document.querySelector('dialog[aria-label="History, large"]').open`);
	await student.pressSpecialKey('Escape', 27);
	await student.waitUntil(`!document.querySelector('dialog[aria-label="History, large"]').open`);
	await student.clickButton('Reset practice');
	await pause(3_000);
	return '"Step 22" is in view; the large map opened and Esc closed it';
}

/**
 * Starts the medium challenge and checks its files appear, then goes back to the easy one.
 * @param student - the student actions
 * @returns what the working tree showed
 */
async function checkStartChallenge(student: StudentActions): Promise<string> {
	const workingTreeShows = (fileName: string): string =>
		`document.querySelector('section[aria-label="Working tree"]')?.innerText.includes('${fileName}')`;
	// The heading is styled in capitals, so compare without case.
	const activeHeadingIs = (heading: string): string =>
		`document.querySelector('section[aria-label="Active challenge"] header')?.innerText.toLowerCase().includes('${heading.toLowerCase()}')`;
	try {
		await student.evaluate(startChallengeScript('Two changes, two commits'));
		await student.waitUntil(workingTreeShows('login.js'), 20_000);
		await student.waitUntil(activeHeadingIs('Challenge 2 · Medium'));
	} finally {
		// Always go back to the easy challenge, so later checks start from it.
		await student.evaluate(startChallengeScript('Save the release notes on their own'));
		await student.waitUntil(activeHeadingIs('Challenge 1 · Easy'));
		await student.waitUntil(workingTreeShows('notes.txt'), 20_000);
	}
	return 'medium set up login.js; the easy one brought notes.txt back';
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
