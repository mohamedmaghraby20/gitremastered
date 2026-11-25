/**
 * check-terminal.ts
 * Checkpoint B, played in the real desktop app: open the pilot lesson, wait for the shell,
 * type "git status" and print what the real shell answered.
 * Run from app/:  node scripts/student-driver/check-terminal.ts
 */

import { DevToolsConnection } from './devtools-connection.ts';
import { debuggingPort, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/**
 * Plays Checkpoint B and prints the terminal.
 * Input: none. Output: none; it exits with code 1 if "git status" did not answer.
 */
async function checkTerminal(): Promise<void> {
	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	try {
		const student = new StudentActions(connection);
		await student.openLesson('three-areas');
		await student.waitForPrompt();
		await student.typeCommand('git status');
		await student.waitUntil(
			`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.includes('no changes added to commit'))`
		);
		console.log(await student.readTerminal());
		console.log('\nCheckpoint B: the real shell answered "git status".');
	} finally {
		connection.close();
		await stopReviewApp(appProcess);
	}
}

checkTerminal().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
