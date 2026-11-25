/**
 * course-content.ts
 * The real course, loaded once from the repo's content/ folder.
 * Vite reads the files when it bundles the app (import.meta.glob), so the lessons ship inside
 * the app and no file is read from disk while the student uses it.
 */

import { buildCourseContent, findLessonById, type ContentFiles } from './load-lessons.ts';
import type { Lesson } from '../types/lesson.ts';
import { findLessonPlace, type LessonPlace } from './lesson-navigation.ts';

/**
 * Every lesson file and path file, as text, keyed by Vite's relative path
 * (e.g. "../../../../content/lessons/three-areas/lesson.md").
 */
const filesByImportPath = import.meta.glob<string>(
	['../../../../content/lessons/*/*.{md,yaml}', '../../../../content/paths/*.yaml'],
	{ query: '?raw', import: 'default', eager: true }
);

/**
 * Re-keys the files by their path inside content/, as buildCourseContent expects.
 * @param filesByPath - files keyed by Vite's relative import path
 * @returns files keyed like "lessons/three-areas/lesson.md"
 */
function keyByContentPath(filesByPath: Record<string, string>): ContentFiles {
	const contentFiles: ContentFiles = {};
	for (const [importPath, fileText] of Object.entries(filesByPath)) {
		const contentPath = importPath.slice(importPath.indexOf('content/') + 'content/'.length);
		contentFiles[contentPath] = fileText;
	}
	return contentFiles;
}

/** The loaded course. A broken content file throws here, naming the file. */
export const courseContent = buildCourseContent(keyByContentPath(filesByImportPath));

/**
 * Looks up a lesson of the real course.
 * @param lessonId - e.g. "three-areas"
 * @returns the lesson, or undefined if there is none with this ID
 */
export function getLesson(lessonId: string): Lesson | undefined {
	return findLessonById(courseContent, lessonId);
}

/** The path the app follows for numbering and Previous / Next links. */
const mainPathId = 'pro-path';

/**
 * Finds a lesson's place in the pro path: its number, module and neighbours.
 * @param lessonId - e.g. "three-areas"
 * @returns its place, or undefined if the pro path does not list it
 */
export function getLessonPlace(lessonId: string): LessonPlace | undefined {
	const mainPath = courseContent.paths.get(mainPathId);
	if (mainPath === undefined) {
		return undefined;
	}
	const lessonTitles = new Map(
		[...courseContent.lessons.values()].map((lesson) => [lesson.id, lesson.title])
	);
	return findLessonPlace(mainPath, lessonTitles, lessonId);
}

/**
 * Lists the lessons of the first module of the pro path, for the sidebar.
 * @returns the module's title and its lessons (ID and title), or null if there is no path yet
 */
export function getFirstModuleOutline(): {
	moduleTitle: string;
	lessons: { id: string; title: string }[];
} | null {
	const firstModule = courseContent.paths.get(mainPathId)?.modules[0];
	if (firstModule === undefined) {
		return null;
	}
	const lessons = firstModule.lessonIds.map((lessonId) => ({
		id: lessonId,
		title: getLesson(lessonId)?.title ?? lessonId
	}));
	return { moduleTitle: firstModule.title, lessons };
}
