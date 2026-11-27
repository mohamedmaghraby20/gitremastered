/**
 * course-content.ts
 * The real course, loaded once from the repo's content/ folder.
 * Vite reads the files when it bundles the app (import.meta.glob), so the lessons ship inside
 * the app and no file is read from disk while the student uses it.
 */

import {
	buildCourseContent,
	findLessonById,
	type ContentFiles
} from '@gitremastered/course-engine/content/load-lessons';
import type { Lesson } from '@gitremastered/course-engine/types/lesson';
import {
	findLessonPlace,
	formatLessonNumber,
	type LessonPlace
} from '@gitremastered/course-engine/content/lesson-navigation';
import {
	findReadingMinutes,
	findSourceLabel
} from '@gitremastered/course-engine/content/lesson-facts';
import type { BookPath } from '@gitremastered/course-engine/types/book-path';
import type { LearningPath } from '@gitremastered/course-engine/types/learning-path';
import type { CommandPage, GlossaryTerm } from '@gitremastered/course-engine/types/reference';

/**
 * Every lesson, path, command page and glossary file, as text, keyed by Vite's relative path
 * (e.g. "../../../content/lessons/three-areas/lesson.md").
 */
const filesByImportPath = import.meta.glob<string>(
	[
		'../../../content/lessons/*/*.{md,yaml}',
		'../../../content/paths/*.yaml',
		'../../../content/commands/*.md',
		'../../../content/glossary.yaml',
		// coverage.md is for course reviewers, not students: it stays out of the app.
		'!../../../content/lessons/*/coverage.md'
	],
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

/** What a list row or card shows about one lesson (home, course map, search). */
export type LessonCard = {
	id: string;
	numberLabel: string | null; // "05", its place in the pro path; null if the path lacks it
	title: string;
	lede: string; // Markdown, one or two sentences
	moduleTitle: string;
	sourceLabel: string; // "Pro Git 2.2" or "Beyond the book"
	readingMinutes: number;
};

/**
 * Gathers what lists show about a lesson.
 * @param lessonId - e.g. "three-areas"
 * @returns the card, or undefined for an unknown lesson
 */
export function getLessonCard(lessonId: string): LessonCard | undefined {
	const lesson = getLesson(lessonId);
	if (lesson === undefined) {
		return undefined;
	}
	const place = getLessonPlace(lessonId);
	return {
		id: lesson.id,
		numberLabel: place === undefined ? null : formatLessonNumber(place.lessonNumber),
		title: lesson.title,
		lede: lesson.lede,
		moduleTitle: place?.moduleTitle ?? lesson.module,
		sourceLabel: findSourceLabel(lesson),
		readingMinutes: findReadingMinutes(lesson)
	};
}

/**
 * The pro path: modules ordered by what a working developer needs.
 * @returns the path, or undefined if its file is missing
 */
export function getProPath(): LearningPath | undefined {
	return courseContent.paths.get(mainPathId);
}

/**
 * The Book path: the course in Pro Git's chapter order.
 * @returns the path, or null if its file is missing
 */
export function getBookPath(): BookPath | null {
	return courseContent.bookPath;
}

/**
 * Looks up one command page.
 * @param commandId - e.g. "git-status"
 * @returns the page, or undefined if there is none with this ID
 */
export function getCommandPage(commandId: string): CommandPage | undefined {
	return courseContent.commands.get(commandId);
}

/**
 * Lists every command page, in file-name order.
 * @returns the pages
 */
export function listCommandPages(): CommandPage[] {
	return [...courseContent.commands.values()];
}

/**
 * Lists every glossary term, in file order.
 * @returns the terms
 */
export function listGlossaryTerms(): GlossaryTerm[] {
	return courseContent.glossary;
}
