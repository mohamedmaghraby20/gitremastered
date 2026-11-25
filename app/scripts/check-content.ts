/**
 * check-content.ts
 * Command-line check run before every build (`pnpm build`, and so `pnpm tauri build`):
 * loads every file in content/ and stops the build with a readable message if one is broken.
 * The loading itself is the same code the app uses (src/lib/content/load-lessons.ts).
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCourseContent, type ContentFiles } from '../src/lib/content/load-lessons.ts';
import { ContentError } from '../src/lib/content/content-error.ts';

const contentFolderPath = fileURLToPath(new URL('../../content', import.meta.url));

/**
 * Reads the lesson and path files of content/, keyed like "lessons/three-areas/lesson.md".
 * @param folderPath - the content folder
 * @returns the files' texts
 */
function readContentFiles(folderPath: string): ContentFiles {
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
		if (isLessonFile || isPathFile) {
			contentFiles[contentPath] = readFileSync(fullPath, 'utf8');
		}
	}
	return contentFiles;
}

/**
 * Loads the content and reports the result. Inputs: none. Output: none; sets a failing exit
 * code when a file is broken.
 */
function checkContent(): void {
	try {
		const courseContent = buildCourseContent(readContentFiles(contentFolderPath));
		console.log(
			`Content OK: ${courseContent.lessons.size} lessons, ${courseContent.paths.size} paths`
		);
	} catch (error) {
		if (error instanceof ContentError) {
			console.error(`Broken content file. ${error.message}`);
			process.exitCode = 1;
			return;
		}
		throw error;
	}
}

checkContent();
