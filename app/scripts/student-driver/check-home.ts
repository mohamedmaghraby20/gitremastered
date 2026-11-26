/**
 * check-home.ts
 * Plays the home screen in the real desktop app, as a returning student:
 * stage a file in the pilot lesson, go home, see the lesson and the practice repository on the
 * "Pick up where you left off" card, press Enter, and find the file still staged in the lesson
 * (opening a lesson keeps the practice folder as the student left it).
 * Run from app/:  pnpm review:home   (build the review copy first: pnpm review:build)
 */

import { DevToolsConnection } from './devtools-connection.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** Page script: true when any terminal row contains the given text. */
function terminalShows(text: string): string {
	return `[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.replaceAll('\\u00a0', ' ').includes(${JSON.stringify(text)}))`;
}

/**
 * Stages notes.txt in a freshly reset pilot lesson.
 * @param student - the student actions
 */
async function stageNotesInPilot(student: StudentActions): Promise<void> {
	await student.openLesson('three-areas');
	await student.waitForPrompt();
	await student.clickButton('Reset practice');
	/*
	 * The reset rebuilds the folder and restarts the shell. The old prompt is still on screen
	 * for a moment, so give the rebuild time before waiting for the new prompt; otherwise
	 * "git add" could run first and the rebuild would undo it.
	 */
	await pause(3_000);
	await student.waitForPrompt();
	await student.typeCommand('git status --short');
	await student.waitUntil(terminalShows('?? notes.txt'), 20_000);
	await student.typeCommand('git add notes.txt && git status --short');
	await student.waitUntil(terminalShows('A  notes.txt'));
}

/**
 * Goes home and reads what the continue card says.
 * @param student - the student actions
 * @returns the card's heading and the practice sentence
 */
async function readHomeCard(student: StudentActions): Promise<string> {
	await student.evaluate(`document.querySelector('nav a[href="/"]').click()`);
	await student.waitUntil(
		`document.querySelector('h1')?.textContent.includes('Pick up where you left off')`
	);
	await student.waitUntil(
		`document.body.innerText.includes('notes.txt is staged but not committed yet.')`
	);
	return student.readText('section[aria-label="Continue learning"] h2');
}

/**
 * Presses Enter with nothing focused and checks the lesson opens with notes.txt still staged.
 * @param student - the student actions
 */
async function continueWithEnter(student: StudentActions): Promise<void> {
	await student.evaluate(`document.activeElement?.blur()`);
	await student.pressSpecialKey('Enter', 13);
	await student.waitUntil(`location.pathname.endsWith('/lessons/three-areas')`);
	await student.waitForPrompt();
	await student.typeCommand('git status --short');
	await student.waitUntil(terminalShows('A  notes.txt'));
}

/**
 * Runs the home check and prints each step's result.
 * Input: none. Output: none; it exits with code 1 if a step failed.
 */
async function checkHome(): Promise<void> {
	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	try {
		const student = new StudentActions(connection);
		await stageNotesInPilot(student);
		console.log('✓ Staged notes.txt in the pilot lesson');
		const cardTitle = await readHomeCard(student);
		console.log(`✓ Home continues "${cardTitle}" and says notes.txt is staged`);
		await continueWithEnter(student);
		console.log('✓ Enter reopened the lesson, and notes.txt is still staged');
	} finally {
		connection.close();
		await stopReviewApp(appProcess);
	}
}

checkHome().catch((error: unknown) => {
	console.error(`✗ ${String(error)}`);
	process.exitCode = 1;
});
