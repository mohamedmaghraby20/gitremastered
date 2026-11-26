/**
 * play-course.ts
 * Plays every challenge of the course in the real desktop app (the review copy), the way a
 * student would: it opens the lesson from the course map, presses "Start this challenge",
 * types the challenge's reference solution into the real terminal, and waits for the goals
 * to tick themselves. A few challenges also check what the picture shows (a faded commit
 * after an amend, the Stash shelf, the distance to origin/main ...).
 *
 * `pnpm test:missions` already proves each solution reaches its goals with real Git. This
 * run adds the rest of the chain: the practice workspace, the terminal, the folder watcher,
 * the snapshot and the screen.
 *
 * Run from app/ (after `pnpm review:build`):
 *   pnpm review:course                      every lesson
 *   pnpm review:course remotes refspecs     only these lessons
 */

import { buildCourseContent } from '../../src/lib/content/load-lessons.ts';
import type { Lesson } from '../../src/lib/types/lesson.ts';
import type { Challenge } from '../../src/lib/types/mission.ts';
import { readContentFiles } from '../read-content-files.ts';
import { DevToolsConnection } from './devtools-connection.ts';
import { debuggingPort, pause, startReviewApp, stopReviewApp } from './review-app.ts';
import { StudentActions } from './student-actions.ts';

/** Page script: the active challenge's ticket. */
const ticket = `document.querySelector('section[aria-label="Active challenge"]')`;

/** Page script: all the text on the visualizer board. */
const boardText = `document.querySelector('section[aria-label="Visualizer"]').innerText`;

/**
 * Extra checks of the picture, run after a challenge's goals are met. Each is a page script
 * that must become true. Keyed by "lesson-id/challenge-id".
 */
const pictureChecks: Record<string, { what: string; condition: string }> = {
	'fix-last-commit/fix-the-typo': {
		what: 'the replaced commit stays on the map, faded',
		condition: `document.querySelector('[data-testid="commit-station"][data-unreachable="true"]') !== null`
	},
	'stash-and-clean/shelve-and-fix': {
		what: 'the Stash shelf lists the stashed work',
		condition: `document.querySelector('[data-testid="stash-shelf"]') !== null`
	},
	'remotes/get-teammates-commit': {
		what: 'the header says main is level with origin/main',
		condition: `${boardText}.includes('level with origin/main')`
	},
	'tags-and-releases/tag-the-release': {
		what: 'the map shows the tag v1.0',
		condition: `${boardText}.includes('v1.0')`
	},
	'branch-and-merge/merge-the-menu': {
		what: 'the map has two rows of stations',
		condition: `new Set([...document.querySelectorAll('.svelte-flow__node')].map((node) => node.style.transform.split(',')[1])).size >= 2`
	}
};

/** One challenge's result. */
type PlayResult = { label: string; hasPassed: boolean; note: string };

/**
 * Opens a lesson from the course map, like a student would.
 * @param student - the student actions
 * @param lessonId - the lesson to open
 */
async function openLessonFromCourseMap(student: StudentActions, lessonId: string): Promise<void> {
	await student.waitUntil(`document.querySelector('a[href$="/course-map"]') !== null`, 20_000);
	await student.evaluate(`document.querySelector('a[href$="/course-map"]').click()`);
	await student.waitUntil(`location.pathname.endsWith('/course-map')`);
	await student.openLesson(lessonId);
}

/**
 * Makes one challenge the active one, from a fresh practice folder.
 * @param student - the student actions
 * @param challenge - the challenge to start
 */
async function startChallenge(student: StudentActions, challenge: Challenge): Promise<void> {
	// The lesson's own practice folder is still being built right after it opens: wait for it.
	await student.waitForPrompt(30_000);
	const card = `[...document.querySelectorAll('li')].find((item) => item.querySelector('h3')?.innerText === ${JSON.stringify(challenge.title)})`;
	await student.waitUntil(`${card} !== undefined`);
	const hasStartButton = await student.evaluate<boolean>(
		`${card}.querySelector('button') !== null`
	);
	if (hasStartButton) {
		await student.evaluate(`${card}.querySelector('button').click()`);
	} else {
		// Already the active challenge: reset it, so earlier typing cannot help or hurt.
		await student.clickButton('Reset practice');
	}
	await student.waitUntil(
		`${card}.innerText.includes('Working on it') && ${ticket} !== null`,
		20_000
	);
	// The practice folder is rebuilt: the old terminal goes away and a new shell starts.
	await student
		.waitUntil(`document.querySelector('.xterm-helper-textarea') === null`, 3_000)
		.catch(() => undefined);
	await student.waitUntil(`document.querySelector('.xterm-helper-textarea') !== null`, 30_000);
	await pause(1_000);
	await student.waitForPrompt(30_000);
}

/**
 * Types a challenge's reference solution, one line at a time.
 * @param student - the student actions
 * @param challenge - the challenge being played
 */
async function typeSolution(student: StudentActions, challenge: Challenge): Promise<void> {
	// A student's commit without -m would open an editor; here nobody is there to close it.
	const commandLines = ['export GIT_EDITOR=true', ...challenge.solution];
	for (const commandLine of commandLines) {
		await student.typeCommand(commandLine);
		await pause(400);
		await student.waitForPrompt(30_000);
	}
}

/**
 * Plays one challenge and reports what happened.
 * @param student - the student actions
 * @param lesson - the lesson (already open)
 * @param challenge - the challenge to play
 * @returns the result
 */
async function playChallenge(
	student: StudentActions,
	lesson: Lesson,
	challenge: Challenge
): Promise<PlayResult> {
	const label = `${lesson.id}/${challenge.id}`;
	const goalCount = challenge.goals.length;
	try {
		await startChallenge(student, challenge);
		await typeSolution(student, challenge);
		await student.waitUntil(
			`${ticket}.querySelector('header').innerText.includes('${goalCount} / ${goalCount} done')`,
			15_000
		);
		const pictureCheck = pictureChecks[label];
		if (pictureCheck !== undefined) {
			await student.waitUntil(pictureCheck.condition, 10_000);
			return { label, hasPassed: true, note: `${goalCount} goals; ${pictureCheck.what}` };
		}
		return { label, hasPassed: true, note: `${goalCount} goals` };
	} catch (error) {
		const ticketText = await student
			.evaluate<string>(`${ticket}?.innerText ?? 'no ticket on screen'`)
			.catch(() => 'the page did not answer');
		return {
			label,
			hasPassed: false,
			note: `${String(error)}\n      ${ticketText.replaceAll('\n', ' | ')}`
		};
	}
}

/**
 * Plays the chosen lessons and sets a failing exit code if any challenge failed.
 * Input: none (lesson IDs come from the command line; none means every lesson).
 */
async function playCourse(): Promise<void> {
	const courseContent = buildCourseContent(readContentFiles());
	const wantedLessonIds = process.argv.slice(2);
	const pathLessonIds =
		courseContent.paths.get('pro-path')?.modules.flatMap((pathModule) => pathModule.lessonIds) ??
		[];
	const lessonIds = wantedLessonIds.length > 0 ? wantedLessonIds : pathLessonIds;

	const appProcess = await startReviewApp();
	const connection = await DevToolsConnection.connect(debuggingPort);
	const student = new StudentActions(connection);
	const results: PlayResult[] = [];
	try {
		for (const lessonId of lessonIds) {
			const lesson = courseContent.lessons.get(lessonId);
			if (lesson === undefined) {
				results.push({ label: lessonId, hasPassed: false, note: 'no such lesson' });
				continue;
			}
			await openLessonFromCourseMap(student, lessonId);
			for (const challenge of lesson.challenges) {
				const result = await playChallenge(student, lesson, challenge);
				console.log(`${result.hasPassed ? 'PASS' : 'FAIL'}  ${result.label}\n      ${result.note}`);
				results.push(result);
			}
		}
	} finally {
		connection.close();
		await stopReviewApp(appProcess);
	}
	const failedCount = results.filter((result) => !result.hasPassed).length;
	console.log(
		`\n${results.length - failedCount} of ${results.length} challenges passed in the app.`
	);
	if (failedCount > 0) {
		process.exitCode = 1;
	}
}

playCourse().catch((error: unknown) => {
	console.error(error);
	process.exitCode = 1;
});
