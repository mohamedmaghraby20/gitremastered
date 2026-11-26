/**
 * run-missions.test.ts
 * `pnpm test:missions`: every challenge of every lesson, run for real. Its setup and reference
 * solution must reach every goal. A deliberately wrong solution must fail, naming the goal it
 * missed.
 *
 * With the DRAFT_LESSON environment variable set (by `pnpm lesson:check`), only that lesson's
 * challenges run, on the committed content plus the draft's own files.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { buildCourseContent } from '../../src/lib/content/load-lessons.ts';
import { readContentFiles } from '../../scripts/read-content-files.ts';
import {
	readDraftContentFiles,
	readDraftFromEnvironment
} from '../../scripts/read-draft-content.ts';
import { buildSnapshotPrinter, runMission } from './mission-runner.ts';

/** The one lesson being written, when `pnpm lesson:check` started this run; otherwise null. */
const draft = readDraftFromEnvironment();
const courseContent = buildCourseContent(
	draft === null ? readContentFiles() : readDraftContentFiles(draft)
);
/**
 * Every local challenge (or only the draft lesson's), labelled like "three-areas / release-notes".
 * GitHub challenges need an account and run in `pnpm test:github` instead (assumption A7).
 */
const challenges = [...courseContent.lessons.values()]
	.filter((lesson) => draft === null || lesson.id === draft.lessonId)
	.flatMap((lesson) =>
		lesson.challenges
			.filter((challenge) => challenge.github === null)
			.map((challenge) => [`${lesson.id} / ${challenge.id}`, challenge] as const)
	);

/** The pilot's easy challenge, used by the wrong-solution tests below. */
const pilotChallenge = courseContent.lessons.get('three-areas')?.challenges[0];

beforeAll(() => {
	buildSnapshotPrinter();
});

// A lesson whose challenges all run on GitHub has nothing to run here.
describe.skipIf(challenges.length === 0)('every challenge', () => {
	it.each(challenges)(
		'%s: the reference solution reaches every goal',
		(challengeLabel, challenge) => {
			const result = runMission(challengeLabel.replace(' / ', '-'), challenge);
			expect(result.missedGoals).toEqual([]);
		}
	);
});

describe.skipIf(draft !== null)('a wrong solution', () => {
	it('fails, naming the goal it missed', () => {
		if (pilotChallenge === undefined) {
			throw new Error('The pilot lesson three-areas is missing');
		}
		// Commits README.md too, which the mission says to keep out.
		const wrongMission = {
			...pilotChallenge,
			solution: ['git add notes.txt README.md', 'git commit -q -m "Add everything"']
		};

		const result = runMission('wrong-solution', wrongMission);

		expect(result.missedGoals).toEqual(['README.md is still changed, not committed']);
	});
});

describe.skipIf(draft !== null)('a shortcut that saves nothing', () => {
	it('does not count as committing the file (pilot review finding)', () => {
		if (pilotChallenge === undefined) {
			throw new Error('The pilot lesson three-areas is missing');
		}
		// Deletes notes.txt and makes an empty commit: no pending change for notes.txt, no save.
		const shortcutMission = {
			...pilotChallenge,
			solution: ['rm notes.txt', 'git commit -q --allow-empty -m "Nothing"']
		};

		const result = runMission('shortcut-solution', shortcutMission);

		expect(result.missedGoals).toEqual(['notes.txt is saved in a new commit']);
	});
});

describe.skipIf(draft !== null)('the re-include trap', () => {
	it('fails when the folder itself is ignored: Git never looks inside it', () => {
		const keepOneFile = courseContent.lessons
			.get('ignoring-files')
			?.challenges.find((challenge) => challenge.id === 'keep-one-build-file');
		if (keepOneFile === undefined) {
			throw new Error('The challenge keep-one-build-file is missing');
		}
		// "build/" then "!build/NOTES.md": the second line cannot bring the file back.
		const trapSolution = {
			...keepOneFile,
			solution: [
				"printf 'build/\n!build/NOTES.md\n' >> .gitignore",
				'git add .gitignore',
				'git commit -q -m "Ignore build"'
			]
		};

		const result = runMission('re-include-trap', trapSolution);

		expect(result.missedGoals).toEqual(['build/NOTES.md is committed']);
	});
});
