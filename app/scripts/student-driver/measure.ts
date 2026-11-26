/**
 * measure.ts
 * SPEC §10 items 4 and 10, measured in the real desktop app:
 *  - the visualizer delay: from pressing Enter on a Git command to the desk showing the result;
 *  - the memory of the app and its web view processes with the pilot lesson open.
 * Run from app/:  node scripts/student-driver/measure.ts
 */

import { DevToolsConnection } from './devtools-connection.ts';
import { measureProcessTree } from './process-memory.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** How many files are staged one by one; every fourth one is followed by a commit. */
const fileCount = 12;

/** Page script: the visible text of the staging area zone on the desk. */
const stagingText = `document.querySelector('section[aria-label="Staging area"]').innerText`;

/** One timed command. */
type DelaySample = { commandLine: string; milliseconds: number };

/**
 * Types a command and times how long until the screen shows its result.
 * @param student - the student actions
 * @param commandLine - the Git command to type
 * @param resultCondition - page JavaScript that is true once the visualizer shows the result
 * @returns the timed sample
 */
async function timeCommand(
	student: StudentActions,
	commandLine: string,
	resultCondition: string
): Promise<DelaySample> {
	const startTime = performance.now();
	await student.typeCommand(commandLine);
	await student.waitUntil(resultCondition, 5_000);
	const milliseconds = Math.round(performance.now() - startTime);
	return { commandLine, milliseconds };
}

/**
 * Stages files one at a time and commits after every fourth, timing each command.
 * @param student - the student actions
 * @returns every timed sample
 */
async function measureDelays(student: StudentActions): Promise<DelaySample[]> {
	await student.typeCommand(`for i in $(seq 1 ${fileCount}); do echo x > f$i.txt; done`);
	await student.waitUntil(`document.body.innerText.includes('f${fileCount}.txt')`);
	await pause(500);
	const samples: DelaySample[] = [];
	for (let fileNumber = 1; fileNumber <= fileCount; fileNumber += 1) {
		const fileName = `f${fileNumber}.txt`;
		const staged = `${stagingText}.includes('${fileName}')`;
		samples.push(await timeCommand(student, `git add ${fileName}`, staged));
		await pause(300);
		if (fileNumber % 4 === 0) {
			const committed = `!${stagingText}.includes('${fileName}')`;
			samples.push(await timeCommand(student, `git commit -q -m "Add ${fileName}"`, committed));
			await pause(300);
		}
	}
	return samples;
}

/**
 * Prints the delay samples and their summary.
 * @param samples - the timed commands
 */
function printDelays(samples: DelaySample[]): void {
	for (const sample of samples) {
		console.log(`${String(sample.milliseconds).padStart(5)} ms  ${sample.commandLine}`);
	}
	const sorted = samples
		.map((sample) => sample.milliseconds)
		.sort((first, second) => first - second);
	const median = sorted[Math.floor(sorted.length / 2)];
	const slowest = sorted[sorted.length - 1];
	console.log(`\n${samples.length} commands · median ${median} ms · slowest ${slowest} ms`);
}

/**
 * Prints the memory of the app's process tree.
 * @param rootProcessId - the app's process ID
 */
function printMemory(rootProcessId: number): void {
	const report = measureProcessTree(rootProcessId);
	console.log(`\nMemory with the pilot open (${report.processCount} processes):`);
	for (const entry of report.byProcess) {
		console.log(`${String(entry.workingSetMegabytes).padStart(5)} MB  ${entry.name}`);
	}
	console.log(
		`Total working set ${report.workingSetMegabytes} MB · private ${report.privateMegabytes} MB`
	);
}

/**
 * Starts the review copy, measures, prints, and closes it.
 * Input: none. Output: none.
 */
async function measure(): Promise<void> {
	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	try {
		const student = new StudentActions(connection);
		await student.openLesson('three-areas');
		await student.waitForPrompt();
		// Start from a fresh practice folder: an earlier run may have left its files committed.
		await student.clickButton('Reset practice');
		await pause(3_000);
		await student.waitForPrompt(30_000);
		await student.waitUntil(`${stagingText} !== undefined`);
		await pause(2_000);
		if (appProcess.pid !== undefined) {
			printMemory(appProcess.pid);
		}
		printDelays(await measureDelays(student));
	} finally {
		connection.close();
		await stopReviewApp(appProcess);
	}
}

measure().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
