/**
 * load-lessons.test.ts
 * Tests for turning a set of content files into the course: lessons by ID and paths.
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../tests/fixtures/read-fixture.ts';
import { buildCourseContent, findLessonById, type ContentFiles } from './load-lessons.ts';

const pathText = `id: pro-path
title: Pro path
modules:
  - id: daily-loop
    title: Your daily loop
    lessons: [sample-lesson]
`;

const commandPageText = `---
id: git-status
command: git status
group: Daily loop
summary: Shows which files changed and which are staged.
usage: ["git status"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
lessons: [sample-lesson]
---

Lists your files by area.
`;

const glossaryText = `terms:
  - id: staging-area
    term: staging area
    meaning: The changes picked for the next commit.
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
		'lessons/sample-lesson/challenges.yaml': readSampleLessonFile('challenges.yaml'),
		'lessons/sample-lesson/quiz.yaml': readSampleLessonFile('quiz.yaml'),
		'paths/pro-path.yaml': pathText
	};
}

describe('buildCourseContent', () => {
	it('loads a valid lesson with its challenge and quiz', () => {
		const courseContent = buildCourseContent(sampleContentFiles());
		const lesson = findLessonById(courseContent, 'sample-lesson');
		expect(lesson?.title).toBe('A sample lesson');
		expect(lesson?.lede).toBe('This sentence is the lede.');
		expect(lesson?.challenges).toHaveLength(3);
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
		contentFiles['lessons/other-name/challenges.yaml'] = readSampleLessonFile('challenges.yaml');
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

	it('rejects a lesson challenge without hints, and a checkpoint challenge with hints', () => {
		const withoutHints = sampleContentFiles();
		withoutHints['lessons/sample-lesson/challenges.yaml'] = readSampleLessonFile(
			'challenges.yaml'
		).replace(/ {4}hints:\n( {6}- .*\n)+/, '');
		expect(() => buildCourseContent(withoutHints)).toThrow(
			'challenge "commit-notes": "hints" needs at least 1 item'
		);

		const checkpointWithHints = sampleContentFiles();
		checkpointWithHints['lessons/sample-lesson/lesson.md'] = readSampleLessonFile(
			'lesson.md'
		).replace('readFirst: [start-a-repo]', 'readFirst: [start-a-repo]\ncheckpoint: true');
		expect(() => buildCourseContent(checkpointWithHints)).toThrow(
			'challenge "commit-notes": a checkpoint has no hints'
		);
	});

	it('loads a checkpoint whose challenges have no hints', () => {
		const checkpoint = sampleContentFiles();
		checkpoint['lessons/sample-lesson/lesson.md'] = readSampleLessonFile('lesson.md').replace(
			'readFirst: [start-a-repo]',
			'readFirst: [start-a-repo]\ncheckpoint: true'
		);
		checkpoint['lessons/sample-lesson/challenges.yaml'] = readSampleLessonFile(
			'challenges.yaml'
		).replace(/ {4}hints:\n( {6}- .*\n)+/g, '');
		const lesson = findLessonById(buildCourseContent(checkpoint), 'sample-lesson');
		expect(lesson?.isCheckpoint).toBe(true);
		expect(lesson?.challenges.every((challenge) => challenge.hints.length === 0)).toBe(true);
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

	it('loads command pages and the glossary, and checks the lessons they name', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['commands/git-status.md'] = commandPageText;
		contentFiles['glossary.yaml'] = glossaryText;
		const courseContent = buildCourseContent(contentFiles);
		expect(courseContent.commands.get('git-status')?.command).toBe('git status');
		expect(courseContent.glossary[0].term).toBe('staging area');

		contentFiles['glossary.yaml'] = glossaryText.replace('[sample-lesson]', '[ghost-lesson]');
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'content/glossary.yaml: unknown lesson "ghost-lesson" in term "staging-area"'
		);
	});

	it('rejects a command page whose id does not match its file name', () => {
		const contentFiles = sampleContentFiles();
		contentFiles['commands/git-stat.md'] = commandPageText;
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'the id "git-status" must match the file name "git-stat"'
		);
	});

	it('rejects a glossary that uses one term id twice', () => {
		const contentFiles = sampleContentFiles();
		const termLines = glossaryText.slice('terms:\n'.length);
		contentFiles['glossary.yaml'] = glossaryText + termLines;
		expect(() => buildCourseContent(contentFiles)).toThrow(
			'the term id "staging-area" is used twice'
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
