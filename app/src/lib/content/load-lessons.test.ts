/**
 * load-lessons.test.ts
 * Tests for turning a set of content files into the course: lessons by ID and paths.
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../../tests/fixtures/read-fixture.ts';
import { buildCourseContent, findLessonById, type ContentFiles } from './load-lessons.ts';

const pathText = `id: pro-path
title: Pro path
modules:
  - id: daily-loop
    title: Your daily loop
    lessons: [sample-lesson]
`;

const bookPathText = `id: book-path
title: Book path
chapters:
  - number: 2
    title: Git Basics
    sections:
      - number: "2.2"
        title: Recording Changes to the Repository
        lessons: [sample-lesson]
`;

/**
 * Builds a set of content files holding the sample lesson and one path.
 * @returns content files keyed by their path inside content/
 */
function sampleContentFiles(): ContentFiles {
	return {
		'lessons/sample-lesson/lesson.md': readSampleLessonFile('lesson.md'),
		'lessons/sample-lesson/mission.yaml': readSampleLessonFile('mission.yaml'),
		'lessons/sample-lesson/quiz.yaml': readSampleLessonFile('quiz.yaml'),
		'paths/pro-path.yaml': pathText
	};
}

describe('buildCourseContent', () => {
	it('loads a valid lesson with its mission and quiz', () => {
		const courseContent = buildCourseContent(sampleContentFiles());
		const lesson = findLessonById(courseContent, 'sample-lesson');
		expect(lesson?.title).toBe('A sample lesson');
		expect(lesson?.lede).toBe('This sentence is the lede.');
		expect(lesson?.mission.goals).toHaveLength(2);
		expect(lesson?.quiz.questions).toHaveLength(2);
	});

	it('loads the paths', () => {
		const courseContent = buildCourseContent(sampleContentFiles());
		const proPath = courseContent.paths.get('pro-path');
		expect(proPath?.modules[0].lessonIds).toEqual(['sample-lesson']);
	});

	it('returns nothing for an unknown lesson ID', () => {
		const courseContent = buildCourseContent(sampleContentFiles());
		expect(findLessonById(courseContent, 'no-such-lesson')).toBeUndefined();
	});

	it('rejects a lesson whose ID does not match its folder', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['lessons/other-name/lesson.md'] = readSampleLessonFile('lesson.md');
		contentFiles['lessons/other-name/mission.yaml'] = readSampleLessonFile('mission.yaml');
		contentFiles['lessons/other-name/quiz.yaml'] = readSampleLessonFile('quiz.yaml');
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'content/lessons/other-name/lesson.md: the id "sample-lesson" must match the folder name "other-name"'
		);
	});

	it('rejects a lesson with a broken special block', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['lessons/sample-lesson/lesson.md'] = readSampleLessonFile('lesson.md').replace(
			'Git keeps three areas.',
			':::shiny\nText\n:::'
		);
		expect(() => buildCourseContent(contentFiles)).toThrow('unknown block ":::shiny"');
	});

	it('rejects a lesson folder without quiz.yaml', () => {
		const contentFiles = sampleContentFiles();
		delete contentFiles['lessons/sample-lesson/quiz.yaml'];
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'content/lessons/sample-lesson/quiz.yaml: the file is missing'
		);
	});

	it('loads the book path when there is one', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['paths/book-path.yaml'] = bookPathText;
		const courseContent = buildCourseContent(contentFiles);
		expect(courseContent.bookPath?.chapters[0].sections[0].lessonIds).toEqual(['sample-lesson']);
		expect(courseContent.paths.has('book-path')).toBe(false);
	});

	it('rejects a book path that lists an unknown lesson', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['paths/book-path.yaml'] = bookPathText.replace('sample-lesson', 'ghost-lesson');
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'content/paths/book-path.yaml: unknown lesson "ghost-lesson" in section "2.2"'
		);
	});

	it('rejects a path that lists an unknown lesson', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['paths/pro-path.yaml'] = pathText.replace('sample-lesson', 'ghost-lesson');
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'content/paths/pro-path.yaml: unknown lesson "ghost-lesson"'
		);
	});
});
