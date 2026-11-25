/**
 * read-fixture.ts
 * Reads sample content files for the content tests, so each test starts from a known-good file.
 */

import { readFileSync } from 'node:fs';

/**
 * Reads one file from tests/fixtures/sample-lesson/.
 * @param fileName - e.g. "lesson.md"
 * @returns the file's text
 */
export function readSampleLessonFile(fileName: string): string {
	const fileUrl = new URL(`./sample-lesson/${fileName}`, import.meta.url);
	return readFileSync(fileUrl, 'utf8');
}
