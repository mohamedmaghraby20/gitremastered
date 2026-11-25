/**
 * load-lessons.ts
 * Turns the raw files of content/ into the course: every lesson (with its mission and quiz),
 * looked up by ID, and every learning path. It only works on texts it is given, so tests can
 * pass in sample files; course-content.ts passes in the real ones.
 */

import type { LearningPath } from '../types/learning-path.ts';
import type { Lesson } from '../types/lesson.ts';
import { ContentError } from './content-error.ts';
import { parseLessonText } from './parse-lesson.ts';
import { parseMissionText } from './parse-mission.ts';
import { parseLearningPathText } from './parse-path.ts';
import { parseQuizText } from './parse-quiz.ts';
import { splitIntoBlocks } from './render-blocks.ts';

/** Content files keyed by their path inside content/, e.g. "lessons/three-areas/lesson.md". */
export type ContentFiles = Record<string, string>;

/** The whole course after loading. */
export type CourseContent = {
	lessons: Map<string, Lesson>; // keyed by lesson ID
	paths: Map<string, LearningPath>; // keyed by path ID
};

/**
 * Loads every lesson and path, and checks that paths only name lessons that exist.
 * @param contentFiles - the files of content/
 * @returns the loaded course
 * @throws ContentError for the first broken file found
 */
export function buildCourseContent(contentFiles: ContentFiles): CourseContent {
	const lessons = new Map<string, Lesson>();
	for (const lessonFolderName of findLessonFolderNames(contentFiles)) {
		const lesson = loadLesson(contentFiles, lessonFolderName);
		lessons.set(lesson.id, lesson);
	}

	const paths = new Map<string, LearningPath>();
	for (const [relativePath, fileText] of Object.entries(contentFiles)) {
		if (!/^paths\/[^/]+\.yaml$/.test(relativePath)) {
			continue;
		}
		const fileName = `content/${relativePath}`;
		const learningPath = parseLearningPathText(fileText, fileName);
		checkPathLessonsExist(learningPath, lessons, fileName);
		paths.set(learningPath.id, learningPath);
	}
	return { lessons, paths };
}

/**
 * Looks up one lesson.
 * @param courseContent - the loaded course
 * @param lessonId - e.g. "three-areas"
 * @returns the lesson, or undefined if no lesson has this ID
 */
export function findLessonById(courseContent: CourseContent, lessonId: string): Lesson | undefined {
	return courseContent.lessons.get(lessonId);
}

/**
 * Finds every lesson folder: any folder under lessons/ that holds at least one file.
 * @param contentFiles - the files of content/
 * @returns the folder names, sorted
 */
function findLessonFolderNames(contentFiles: ContentFiles): string[] {
	const folderNames = new Set<string>();
	for (const relativePath of Object.keys(contentFiles)) {
		const match = /^lessons\/([^/]+)\/[^/]+$/.exec(relativePath);
		if (match !== null) {
			folderNames.add(match[1]);
		}
	}
	return [...folderNames].sort();
}

/**
 * Loads one lesson folder: lesson.md, mission.yaml and quiz.yaml.
 * @param contentFiles - the files of content/
 * @param folderName - the lesson's folder, which must equal its ID
 * @returns the complete lesson
 */
function loadLesson(contentFiles: ContentFiles, folderName: string): Lesson {
	const lessonFileName = `content/lessons/${folderName}/lesson.md`;
	const lessonText = parseLessonText(
		requireFile(contentFiles, `lessons/${folderName}/lesson.md`),
		lessonFileName
	);
	if (lessonText.frontmatter.id !== folderName) {
		const problem = `the id "${lessonText.frontmatter.id}" must match the folder name "${folderName}"`;
		throw new ContentError(lessonFileName, problem);
	}
	// Reading the special blocks now makes a broken block fail the build, not the lesson page.
	for (const sectionText of Object.values(lessonText.sections)) {
		splitIntoBlocks(sectionText, lessonFileName);
	}
	const mission = parseMissionText(
		requireFile(contentFiles, `lessons/${folderName}/mission.yaml`),
		`content/lessons/${folderName}/mission.yaml`
	);
	const quiz = parseQuizText(
		requireFile(contentFiles, `lessons/${folderName}/quiz.yaml`),
		`content/lessons/${folderName}/quiz.yaml`
	);
	return {
		...lessonText.frontmatter,
		lede: lessonText.lede,
		sections: lessonText.sections,
		mission,
		quiz
	};
}

/**
 * Returns a file's text, or fails if the file does not exist.
 * @param contentFiles - the files of content/
 * @param relativePath - the path inside content/
 * @returns the file's text
 */
function requireFile(contentFiles: ContentFiles, relativePath: string): string {
	const fileText = contentFiles[relativePath];
	if (fileText === undefined) {
		throw new ContentError(`content/${relativePath}`, 'the file is missing');
	}
	return fileText;
}

/**
 * Checks that every lesson a path lists exists.
 * @param learningPath - the path to check
 * @param lessons - the loaded lessons
 * @param fileName - the path's file, for error messages
 */
function checkPathLessonsExist(
	learningPath: LearningPath,
	lessons: Map<string, Lesson>,
	fileName: string
): void {
	for (const pathModule of learningPath.modules) {
		for (const lessonId of pathModule.lessonIds) {
			if (!lessons.has(lessonId)) {
				throw new ContentError(
					fileName,
					`unknown lesson "${lessonId}" in module "${pathModule.id}"`
				);
			}
		}
	}
}
