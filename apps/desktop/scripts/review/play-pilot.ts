/**
 * play-pilot.ts
 * Plays the pilot lesson as a student in the real desktop app (the review copy), then restarts
 * the app to check progress was kept, and plays the second lesson's first challenge.
 * Prints one line per step: PASS or FAIL, with what was seen.
 * Run from the repository root:  node scripts/review/play-pilot.ts
 */

import type { ChildProcess } from 'node:child_process';
import { DevToolsConnection } from './devtools-connection.ts';
import { pilotSteps, type PilotStep } from './pilot-steps.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** A running review copy with its connection and student. */
type RunningApp = {
	appProcess: ChildProcess;
	connection: DevToolsConnection;
	student: StudentActions;
};

/**
 * Starts the review copy and connects a student to it.
 * Input: none. Output: the running app.
 */
async function openApp(): Promise<RunningApp> {
	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	return { appProcess, connection, student: new StudentActions(connection) };
}

/**
 * Closes the connection and the review copy.
 * @param runningApp - what openApp returned
 */
async function closeApp(runningApp: RunningApp): Promise<void> {
	runningApp.connection.close();
	await stopReviewApp(runningApp.appProcess);
}

/**
 * Runs steps in order and prints each result; a failed step does not stop the rest.
 * @param steps - the steps to run
 * @param student - the student actions
 * @returns how many steps failed
 */
async function runSteps(steps: PilotStep[], student: StudentActions): Promise<number> {
	let failedCount = 0;
	for (const step of steps) {
		try {
			const note = await step.run(student);
			console.log(`PASS  ${step.name}\n      ${note}`);
		} catch (error) {
			failedCount += 1;
			console.log(`FAIL  ${step.name}\n      ${String(error)}`);
		}
	}
	return failedCount;
}

/** Steps after a restart: progress kept, then the second lesson's first challenge. */
const afterRestartSteps: PilotStep[] = [
	{
		name: '7 · progress survives an app restart',
		run: async (student) => {
			await student.waitUntil(
				`document.querySelector('a[href$="/lessons/three-areas"]')?.innerText.includes('✓')`
			);
			return '✓ still next to the pilot after restarting';
		}
	},
	{
		name: '8 · second lesson (content files only) plays end to end',
		run: async (student) => {
			await student.openLesson('ignoring-files');
			await student.waitForPrompt();
			await student.typeCommand("printf 'build/\\n*.log\\n' > .gitignore");
			await pause(300);
			await student.typeCommand('git add .gitignore');
			await pause(300);
			await student.typeCommand('git commit -q -m "Ignore build output and logs"');
			await student.waitUntil(
				`document.querySelector('section[aria-label="Active challenge"] header').innerText.includes('3 / 3 done')`
			);
			return 'ignoring-files first challenge reaches 3 / 3';
		}
	}
];

/**
 * Plays the whole run-through and sets a failing exit code if any step failed.
 * Input: none. Output: none.
 */
async function playPilot(): Promise<void> {
	const firstRun = await openApp();
	let failedCount = 0;
	try {
		failedCount += await runSteps(pilotSteps, firstRun.student);
	} finally {
		await closeApp(firstRun);
	}
	const secondRun = await openApp();
	try {
		failedCount += await runSteps(afterRestartSteps, secondRun.student);
	} finally {
		await closeApp(secondRun);
	}
	console.log(failedCount === 0 ? '\nAll steps passed.' : `\n${failedCount} step(s) failed.`);
	if (failedCount > 0) {
		process.exitCode = 1;
	}
}

playPilot().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
