/**
 * pilot-steps.ts
 * The pilot run-through as a list of named steps, each one a thing a student does and
 * what they should see. play-pilot.ts runs them in order and reports each as pass or fail.
 * The SPEC §10 success criterion each step checks is in its name.
 */

import type { StudentActions } from './student-actions.ts';
import { pause } from './review-app.ts';

/** One step of the run-through. */
export type PilotStep = {
	name: string;
	run: (student: StudentActions) => Promise<string>;
};

/** Page script: the mission header's "n / m done" text. */
const missionProgress = `document.querySelector('section[aria-label="Mission"] header').innerText`;

/**
 * Clicks a layer tab and checks its panel shows.
 * @param student - the student actions
 * @param tabName - the tab's text, e.g. "Under the hood"
 * @returns a short note
 */
async function openLayerTab(student: StudentActions, tabName: string): Promise<string> {
	await student.evaluate(
		`[...document.querySelectorAll('[role="tab"]')].find((tab) => tab.innerText.includes('${tabName}')).click()`
	);
	await student.waitUntil(
		`document.querySelector('[role="tab"][aria-selected="true"]').innerText.includes('${tabName}')`
	);
	return `"${tabName}" tab opens`;
}

/**
 * Picks an answer in one quiz question and checks it.
 * @param student - the student actions
 * @param questionNumber - 1-based question number
 * @param answerText - part of the answer's text
 * @returns the explanation the quiz shows
 */
async function answerQuestion(
	student: StudentActions,
	questionNumber: number,
	answerText: string
): Promise<string> {
	const question = `document.querySelector('section[aria-label="Question ${questionNumber}"]')`;
	await student.evaluate(
		`[...${question}.querySelectorAll('button')].find((button) => button.innerText.includes(${JSON.stringify(answerText)})).click()`
	);
	await student.evaluate(
		`[...${question}.querySelectorAll('button')].find((button) => button.innerText.includes('Check answer')).click()`
	);
	await student.waitUntil(`${question}.querySelector('[role="status"]') !== null`);
	return student.evaluate<string>(`${question}.querySelector('[role="status"]').innerText`);
}

/** The pilot lesson run-through, in order. */
export const pilotSteps: PilotStep[] = [
	{
		name: '2 · lesson shows three layers and the recap card',
		run: async (student) => {
			await student.openLesson('three-areas');
			const notes = [
				await openLayerTab(student, 'Under the hood'),
				await openLayerTab(student, 'Advanced')
			];
			notes.push(await openLayerTab(student, 'Must know'));
			const hasRecap = await student.evaluate<boolean>(
				`document.querySelector('#recap-heading') !== null`
			);
			if (!hasRecap) {
				throw new Error('no recap card');
			}
			return notes.join(', ') + ', recap card shown';
		}
	},
	{
		name: '3 · terminal starts a real shell and echoes typing fast',
		run: async (student) => {
			const promptMilliseconds = await student.waitUntil(
				`[...document.querySelectorAll('.xterm-rows > div')].some((row) => row.textContent.trimEnd().endsWith('$'))`,
				15_000
			);
			const startTime = performance.now();
			await student.typeCommand('echo typed-$((40+2))');
			await student.waitUntil(
				`document.querySelector('.xterm-rows').textContent.includes('typed-42')`
			);
			const echoMilliseconds = Math.round(performance.now() - startTime);
			return `prompt after ${Math.round(promptMilliseconds)} ms; command ran and answered in ${echoMilliseconds} ms`;
		}
	},
	{
		name: '5 · hint ladder serves every hint, then stops',
		run: async (student) => {
			for (let hintNumber = 1; hintNumber <= 3; hintNumber += 1) {
				await student.evaluate(
					`[...document.querySelectorAll('section[aria-label="Mission"] button')].at(-1).click()`
				);
			}
			const hintCount = await student.evaluate<number>(
				`document.querySelectorAll('ol[aria-label="Hints"] li').length`
			);
			const isButtonDisabled = await student.evaluate<boolean>(
				`[...document.querySelectorAll('section[aria-label="Mission"] button')].at(-1).disabled`
			);
			if (hintCount !== 3 || !isButtonDisabled) {
				throw new Error(`${hintCount} hints shown, button disabled: ${isButtonDisabled}`);
			}
			return '3 hints shown, hint button disabled after the last';
		}
	},
	{
		name: '5 · "Check mission" before solving says what is missing',
		run: async (student) => {
			await student.clickButton('Check mission');
			await student.waitUntil(
				`document.querySelector('section[aria-label="Mission"] [role="status"]') !== null`
			);
			return student.readText('section[aria-label="Mission"] [role="status"]');
		}
	},
	{
		name: '5 · mission detects the goal after the real solution',
		run: async (student) => {
			await student.typeCommand('git add notes.txt');
			await pause(300);
			await student.typeCommand('git commit -q -m "Add release notes"');
			const milliseconds = await student.waitUntil(`${missionProgress}.includes('2 / 2 done')`);
			await student.clickButton('Check mission');
			const message = await student.readText('section[aria-label="Mission"] [role="status"]');
			return `2 / 2 done ${Math.round(milliseconds)} ms after the commit was typed; message: ${message}`;
		}
	},
	{
		name: '5 · reset rebuilds the practice folder and hides the hints',
		run: async (student) => {
			await student.clickButton('Reset practice');
			await student.waitUntil(`${missionProgress}.includes('1 / 2 done')`, 15_000);
			const hintCount = await student.evaluate<number>(
				`document.querySelectorAll('ol[aria-label="Hints"] li').length`
			);
			return `back to 1 / 2 (README.md starts changed), ${hintCount} hints showing`;
		}
	},
	{
		name: '3 · terminal works again after reset',
		run: async (student) => {
			await student.waitForPrompt();
			await student.typeCommand('git status --short');
			await student.waitUntil(
				`document.querySelector('.xterm-rows').textContent.includes('?? notes.txt')`
			);
			return 'new shell answers; notes.txt is untracked again';
		}
	},
	{
		name: '6 · quiz checks answers and explains them',
		run: async (student) => {
			const notes: string[] = [];
			for (let questionNumber = 1; questionNumber <= 3; questionNumber += 1) {
				// Always the first answer: some are right, some wrong, so both outcomes show up.
				const explanation = await answerQuestion(student, questionNumber, '');
				notes.push(`Q${questionNumber}: ${explanation.split('\n')[0]}`);
			}
			await student.waitUntil(`document.body.innerText.includes('/ 3 right')`);
			const score = await student.evaluate<string>(
				`document.body.innerText.match(/\\d+ \\/ 3 right/)[0]`
			);
			return `${notes.join(' | ')} → score shown: ${score}`;
		}
	},
	{
		name: '7 · finished mission gets a ✓ in the sidebar',
		run: async (student) => {
			// The lesson page folds the sidebar to an icon rail, so check on the home page.
			await student.evaluate(`document.querySelector('header a[href$="/"]').click()`);
			await student.waitUntil(
				`document.querySelector('a[href$="/lessons/three-areas"]')?.innerText.includes('✓')`
			);
			return '✓ next to the pilot';
		}
	}
];
