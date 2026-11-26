/**
 * load-lessons.ts
 * Turns the raw files of content/ into the course: every lesson (with its challenges and quiz),
 * looked up by ID, every learning path, the Book path, the command pages and the glossary.
 * It only works on texts it is given, so tests can pass in sample files; course-content.ts
 * passes in the real ones.
 */

import type { BookPath } from '../types/book-path.ts';
import type { LearningPath } from '../types/learning-path.ts';
import type { Lesson } from '../types/lesson.ts';
import type { CommandPage, GlossaryTerm } from '../types/reference.ts';
import { checkLessonsExist } from './check-lesson-ids.ts';
import { loadCommandPages, loadGlossary } from './load-reference.ts';
import { checkCourseLinks } from './check-course-links.ts';
import { ContentError } from './content-error.ts';
import { parseLessonText } from './parse-lesson.ts';
import { parseChallengesText } from './parse-challenges.ts';
import { parseBookPathText } from './parse-book-path.ts';
import { parseLearningPathText } from './parse-path.ts';
import { parseQuizText } from './parse-quiz.ts';
import { splitIntoBlocks } from './render-blocks.ts';

/** Content files keyed by their path inside content/, e.g. "lessons/three-areas/lesson.md". */
export type ContentFiles = Record<string, string>;

/** The whole course after loading. */
export type CourseContent = {
	lessons: Map<string, Lesson>; // keyed by lesson ID
	paths: Map<string, LearningPath>; // keyed by path ID, e.g. "pro-path"
	bookPath: BookPath | null; // the course in Pro Git order; null until the file exists
	commands: Map<string, CommandPage>; // keyed by command ID, e.g. "git-status"
	glossary: GlossaryTerm[]; // in file order
};

/** The Book path's file. It has its own shape (chapters and sections, not modules). */
const bookPathFile = 'paths/book-path.yaml';

/**
 * Loads every content file, and checks that every lesson ID a file names exists.
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

	const commands = loadCommandPages(contentFiles, lessons);
	const glossary = loadGlossary(contentFiles, lessons);
	checkCourseLinks(lessons, commands, glossary);
	return {
		lessons,
		paths: loadLearningPaths(contentFiles, lessons),
		bookPath: loadBookPath(contentFiles, lessons),
		commands,
		glossary
	};
}

/**
 * Loads every learning path file except the Book path, and checks their lesson IDs.
 * @param contentFiles - the files of content/
 * @param lessons - the loaded lessons
 * @returns the paths, keyed by path ID
 */
function loadLearningPaths(
	contentFiles: ContentFiles,
	lessons: Map<string, Lesson>
): Map<string, LearningPath> {
	const paths = new Map<string, LearningPath>();
	for (const [relativePath, fileText] of Object.entries(contentFiles)) {
		if (!/^paths\/[^/]+\.yaml$/.test(relativePath) || relativePath === bookPathFile) {
			continue;
		}
		const fileName = `content/${relativePath}`;
		const learningPath = parseLearningPathText(fileText, fileName);
		for (const pathModule of learningPath.modules) {
			checkLessonsExist(pathModule.lessonIds, lessons, fileName, `module "${pathModule.id}"`);
		}
		paths.set(learningPath.id, learningPath);
	}
	return paths;
}

/**
 * Loads the Book path, if its file exists, and checks its lesson IDs.
 * @param contentFiles - the files of content/
 * @param lessons - the loaded lessons
 * @returns the Book path, or null when there is no file
 */
function loadBookPath(contentFiles: ContentFiles, lessons: Map<string, Lesson>): BookPath | null {
	const fileText = contentFiles[bookPathFile];
	if (fileText === undefined) {
		return null;
	}
	const fileName = `content/${bookPathFile}`;
	const bookPath = parseBookPathText(fileText, fileName);
	for (const chapter of bookPath.chapters) {
		for (const section of chapter.sections) {
			checkLessonsExist(section.lessonIds, lessons, fileName, `section "${section.number}"`);
		}
	}
	return bookPath;
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
 * Loads one lesson folder: lesson.md, challenges.yaml and quiz.yaml.
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
	const challenges = parseChallengesText(
		requireFile(contentFiles, `lessons/${folderName}/challenges.yaml`),
		`content/lessons/${folderName}/challenges.yaml`
	);
	const quiz = parseQuizText(
		requireFile(contentFiles, `lessons/${folderName}/quiz.yaml`),
		`content/lessons/${folderName}/quiz.yaml`
	);
	return {
		...lessonText.frontmatter,
		lede: lessonText.lede,
		sections: lessonText.sections,
		challenges,
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
