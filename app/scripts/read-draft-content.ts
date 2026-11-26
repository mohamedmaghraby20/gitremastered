/**
 * read-draft-content.ts
 * Reads content/ the way one lesson author needs it while several lessons are being written
 * at the same time: everything as it is in the last commit, plus the files of the one lesson
 * being drafted. Half-written files of other lessons are left out, so they cannot break this
 * lesson's check.
 *
 * Used by `pnpm lesson:check` and, through the DRAFT_LESSON environment variable, by the
 * mission tests.
 */

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import type { ContentFiles } from '../src/lib/content/load-lessons.ts';
import { readContentFiles } from './read-content-files.ts';

/** The repo's top folder, where Git commands run. */
const repoFolderPath = fileURLToPath(new URL('../..', import.meta.url));

/** Which files belong to the draft: one lesson folder and the command pages it adds or edits. */
export type Draft = { lessonId: string; commandIds: string[] };

/**
 * Reads the draft named by the environment variables DRAFT_LESSON (a lesson ID) and
 * DRAFT_COMMANDS (command IDs separated by commas, optional).
 * @returns the draft, or null when DRAFT_LESSON is not set
 */
export function readDraftFromEnvironment(): Draft | null {
	const lessonId = process.env.DRAFT_LESSON;
	if (lessonId === undefined || lessonId === '') {
		return null;
	}
	const commandIds = (process.env.DRAFT_COMMANDS ?? '').split(',').filter((id) => id !== '');
	return { lessonId, commandIds };
}

/**
 * Reads the committed content plus one draft's own files.
 * @param draft - the lesson being written and its command pages
 * @returns the files' texts, keyed by their path inside content/
 */
export function readDraftContentFiles(draft: Draft): ContentFiles {
	const contentFiles = readContentFiles();
	const ownPaths = new Set([
		...draft.commandIds.map((commandId) => `commands/${commandId}.md`),
		// The draft's glossary additions are part of the shared glossary file.
		'glossary.yaml'
	]);
	const isOwnFile = (contentPath: string): boolean =>
		contentPath.startsWith(`lessons/${draft.lessonId}/`) || ownPaths.has(contentPath);

	for (const contentPath of listGitPaths(['ls-files', '--others', '--exclude-standard'])) {
		if (!isOwnFile(contentPath)) {
			// A new file of another draft: leave it out.
			delete contentFiles[contentPath];
		}
	}
	for (const contentPath of listGitPaths(['ls-files', '--modified'])) {
		if (!isOwnFile(contentPath) && contentPath in contentFiles) {
			// Another draft edited a committed file: use the committed text.
			contentFiles[contentPath] = readCommittedFile(contentPath);
		}
	}
	contentFiles['glossary.yaml'] = dropUnseenLessons(
		contentFiles['glossary.yaml'] ?? '',
		contentFiles
	);
	return contentFiles;
}

/**
 * Removes, from each glossary term's lesson list, the lessons this draft cannot see: while
 * several lessons are written at once, another writer's term may already name its own
 * lesson, which is not committed yet. Comments and layout are kept.
 * @param glossaryText - the shared glossary file
 * @param contentFiles - the files the draft sees
 * @returns the glossary without links to unseen lessons
 */
function dropUnseenLessons(glossaryText: string, contentFiles: ContentFiles): string {
	const seenLessonIds = new Set(
		Object.keys(contentFiles)
			.filter((path) => path.startsWith('lessons/') && path.endsWith('/lesson.md'))
			.map((path) => path.split('/')[1])
	);
	const glossary = parseDocument(glossaryText);
	const glossaryValue = glossary.toJS() as { terms?: { lessons?: string[] }[] } | null;
	const terms = glossaryValue?.terms;
	terms?.forEach((term, index) => {
		const visibleLessons = (term.lessons ?? []).filter((lessonId) => seenLessonIds.has(lessonId));
		glossary.setIn(['terms', index, 'lessons'], visibleLessons);
	});
	return glossary.toString();
}

/**
 * Lists files of content/ with a `git ls-files` command.
 * @param gitArguments - the command, like ["ls-files", "--modified"]
 * @returns the paths inside content/, like "lessons/three-areas/lesson.md"
 */
function listGitPaths(gitArguments: string[]): string[] {
	const output = execFileSync('git', [...gitArguments, '-z', '--', 'content'], {
		cwd: repoFolderPath,
		encoding: 'utf8'
	});
	return output
		.split('\0')
		.filter((path) => path !== '')
		.map((path) => path.slice('content/'.length));
}

/**
 * Reads a content file as it is in the last commit.
 * @param contentPath - the path inside content/
 * @returns the committed text
 */
function readCommittedFile(contentPath: string): string {
	return execFileSync('git', ['show', `HEAD:content/${contentPath}`], {
		cwd: repoFolderPath,
		encoding: 'utf8'
	});
}
