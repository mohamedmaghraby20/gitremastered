/**
 * run-missions.test.ts
 * `pnpm test:missions`: every lesson's mission, run for real. Its setup and reference solution
 * must reach every goal. A deliberately wrong solution must fail, naming the goal it missed.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { buildCourseContent } from '../../src/lib/content/load-lessons.ts';
import { readContentFiles } from '../../scripts/read-content-files.ts';
import { buildSnapshotPrinter, runMission } from './mission-runner.ts';

const courseContent = buildCourseContent(readContentFiles());
const lessons = [...courseContent.lessons.values()];

beforeAll(() => {
	buildSnapshotPrinter();
});

describe('every mission', () => {
	it.each(lessons.map((lesson) => [lesson.id, lesson] as const))(
		'%s: the reference solution reaches every goal',
		(lessonId, lesson) => {
			const result = runMission(lessonId, lesson.mission);
			expect(result.missedGoals).toEqual([]);
		}
	);
});

describe('a wrong solution', () => {
	it('fails, naming the goal it missed', () => {
		const pilotMission = courseContent.lessons.get('three-areas')?.mission;
		if (pilotMission === undefined) {
			throw new Error('The pilot lesson three-areas is missing');
		}
		// Commits README.md too, which the mission says to keep out.
		const wrongMission = {
			...pilotMission,
			solution: ['git add notes.txt README.md', 'git commit -q -m "Add everything"']
		};

		const result = runMission('wrong-solution', wrongMission);

		expect(result.missedGoals).toEqual(['README.md is still changed, not committed']);
	});
});

describe('a shortcut that saves nothing', () => {
	it('does not count as committing the file (pilot review finding)', () => {
		const pilotMission = courseContent.lessons.get('three-areas')?.mission;
		if (pilotMission === undefined) {
			throw new Error('The pilot lesson three-areas is missing');
		}
		// Deletes notes.txt and makes an empty commit: no pending change for notes.txt, no save.
		const shortcutMission = {
			...pilotMission,
			solution: ['rm notes.txt', 'git commit -q --allow-empty -m "Nothing"']
		};

		const result = runMission('shortcut-solution', shortcutMission);

		expect(result.missedGoals).toEqual(['notes.txt is saved in a new commit']);
	});
});
