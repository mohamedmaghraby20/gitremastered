/**
 * read-content-files.ts
 * Reads the lesson, path, command and glossary files of the repo's content/ folder from disk, keyed like
 * "lessons/three-areas/lesson.md". Used by Node scripts and tests (the app itself gets the
 * files from Vite instead, in course-content.ts).
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ContentFiles } from '../content/load-lessons.ts';

/** The repo's content/ folder. */
export const contentFolderPath = fileURLToPath(new URL('../../../../content', import.meta.url));

/**
 * Reads every content file the app loads.
 * @param folderPath - the content folder (the repo's content/ by default)
 * @returns the files' texts, keyed by their path inside content/
 */
export function readContentFiles(folderPath: string = contentFolderPath): ContentFiles {
	const contentFiles: ContentFiles = {};
	const entries = readdirSync(folderPath, { recursive: true, withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isFile()) {
			continue;
		}
		const fullPath = join(entry.parentPath, entry.name);
		const contentPath = relative(folderPath, fullPath).split(sep).join('/');
		const isLessonFile = /^lessons\/[^/]+\/[^/]+\.(md|yaml)$/.test(contentPath);
		const isPathFile = /^paths\/[^/]+\.yaml$/.test(contentPath);
		const isCommandFile = /^commands\/[^/]+\.md$/.test(contentPath);
		const isGlossaryFile = contentPath === 'glossary.yaml';
		if (isLessonFile || isPathFile || isCommandFile || isGlossaryFile) {
			contentFiles[contentPath] = readFileSync(fullPath, 'utf8');
		}
	}
	return contentFiles;
}
