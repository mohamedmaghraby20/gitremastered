/**
 * run-github-challenges.test.ts
 * `pnpm test:github`: every GitHub challenge, run for real on the account signed in to `gh`
 * on this computer (decision 7). Its setup, teammate steps and reference solution must reach
 * every goal, including the ones read from GitHub. Skipped when `gh` is not signed in, so it
 * never fails on a machine without an account (CI does not run it).
 *
 * With the DRAFT_LESSON environment variable set, only that lesson's challenges run.
 */

import { beforeAll, describe, expect, it } from 'vitest';
import { buildCourseContent } from '@gitremastered/course-engine/content/load-lessons';
import { readContentFiles } from '@gitremastered/course-engine/node/read-content-files';
import {
	readDraftContentFiles,
	readDraftFromEnvironment
} from '@gitremastered/course-engine/node/read-draft-content';
import { buildSnapshotPrinter } from '../missions/mission-runner.ts';
import { buildGitHubProgram, isGitHubReady, runGitHubMission } from './github-runner.ts';

/** The one lesson being written, when set; otherwise null. */
const draft = readDraftFromEnvironment();
const courseContent = buildCourseContent(
	draft === null ? readContentFiles() : readDraftContentFiles(draft)
);
/** Every GitHub challenge, labelled like "github-flow-prs / open-your-first-pr". */
const challenges = [...courseContent.lessons.values()]
	.filter((lesson) => draft === null || lesson.id === draft.lessonId)
	.flatMap((lesson) =>
		lesson.challenges
			.filter((challenge) => challenge.github !== null)
			.map((challenge) => [`${lesson.id} / ${challenge.id}`, challenge] as const)
	);

const canRun = isGitHubReady() && challenges.length > 0;

describe.skipIf(!canRun)('every GitHub challenge', () => {
	beforeAll(() => {
		buildSnapshotPrinter();
		buildGitHubProgram();
	});

	// Challenges share practice repositories, so they run one after another.
	it.each(challenges)(
		'%s: the reference solution reaches every goal',
		async (challengeLabel, challenge) => {
			const result = await runGitHubMission(challengeLabel.replace(' / ', '-'), challenge);
			expect(result.missedGoals).toEqual([]);
		}
	);
});

describe.skipIf(canRun)('without a signed-in gh', () => {
	it('skips the GitHub challenges', () => {
		expect(canRun).toBe(false);
	});
});
