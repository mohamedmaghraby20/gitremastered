/**
 * check-lesson.ts
 * `pnpm lesson:check <lesson-id> [command-id ...]`: checks one lesson while it is being
 * written. It loads the committed content plus this lesson's own files (and the command
 * pages named after it), reports the first broken file, and then runs the lesson's
 * challenges with real Git: each setup and reference solution must reach every goal.
 *
 * Example: pnpm lesson:check start-a-repo git-init git-clone
 */

import { spawnSync } from 'node:child_process';
import { ContentError } from '@gitremastered/course-engine/content/content-error';
import { buildCourseContent } from '@gitremastered/course-engine/content/load-lessons';
import {
	readDraftContentFiles,
	type Draft
} from '@gitremastered/course-engine/node/read-draft-content';

/**
 * Checks the draft's content files.
 * @param draft - the lesson and its command pages
 * @returns true when every file loads
 */
function checkDraftContent(draft: Draft): boolean {
	try {
		const courseContent = buildCourseContent(readDraftContentFiles(draft));
		const lesson = courseContent.lessons.get(draft.lessonId);
		if (lesson === undefined) {
			console.error(`There is no lesson folder content/lessons/${draft.lessonId}/ yet.`);
			return false;
		}
		const missingCommandIds = draft.commandIds.filter((id) => !courseContent.commands.has(id));
		if (missingCommandIds.length > 0) {
			console.error(`Missing command pages: ${missingCommandIds.join(', ')}`);
			return false;
		}
		console.log(
			`Content OK: "${lesson.title}", ${lesson.challenges.length} challenges, ` +
				`${lesson.quiz.questions.length} quiz questions, ${draft.commandIds.length} command pages`
		);
		return true;
	} catch (error) {
		if (error instanceof ContentError) {
			console.error(`Broken content file. ${error.message}`);
			return false;
		}
		throw error;
	}
}

/**
 * Runs the draft lesson's challenges through the mission tests.
 * @param draft - the lesson and its command pages
 * @returns true when every challenge's solution reaches every goal
 */
function runDraftChallenges(draft: Draft): boolean {
	// One command line run by the shell: on Windows, pnpm is a script only a shell can start.
	const result = spawnSync('pnpm exec vitest run --config vitest.missions.config.ts', {
		stdio: 'inherit',
		shell: true,
		env: {
			...process.env,
			DRAFT_LESSON: draft.lessonId,
			DRAFT_COMMANDS: draft.commandIds.join(',')
		}
	});
	return result.status === 0;
}

const [lessonId, ...commandIds] = process.argv.slice(2);
if (lessonId === undefined) {
	console.error('Usage: pnpm lesson:check <lesson-id> [command-id ...]');
	process.exitCode = 1;
} else {
	const draft: Draft = { lessonId, commandIds };
	const isContentFine = checkDraftContent(draft);
	const areChallengesFine = isContentFine && runDraftChallenges(draft);
	process.exitCode = isContentFine && areChallengesFine ? 0 : 1;
}
