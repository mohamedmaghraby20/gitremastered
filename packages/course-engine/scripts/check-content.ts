/**
 * check-content.ts
 * Command-line check run before every build (`pnpm build`, and so `pnpm tauri build`):
 * loads every file in content/ and stops the build with a readable message if one is broken.
 * The loading itself is the same code the app uses (packages/course-engine/src/content/load-lessons.ts).
 */

import { buildCourseContent } from '../src/content/load-lessons.ts';
import { ContentError } from '../src/content/content-error.ts';
import { readContentFiles } from '../src/node/read-content-files.ts';

/**
 * Loads the content and reports the result. Inputs: none. Output: none; sets a failing exit
 * code when a file is broken.
 */
function checkContent(): void {
	try {
		const courseContent = buildCourseContent(readContentFiles());
		console.log(
			`Content OK: ${courseContent.lessons.size} lessons, ${courseContent.paths.size} paths` +
				(courseContent.bookPath === null ? '' : ', the Book path') +
				`, ${courseContent.commands.size} command pages, ${courseContent.glossary.length} glossary terms`
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
