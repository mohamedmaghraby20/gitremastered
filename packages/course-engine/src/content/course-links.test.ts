/**
 * course-links.test.ts
 * Tests for reading course links and checking their IDs.
 */

import { describe, expect, it } from 'vitest';
import { courseLinkFallbackHref, findCourseLinks, parseCourseLink } from './course-links.ts';
import { checkCourseLinks } from './check-course-links.ts';
import { sampleLesson } from '../../tests/fixtures/sample-lesson-object.ts';

describe('parseCourseLink', () => {
	it('reads term and lesson addresses', () => {
		expect(parseCourseLink('term:staging-area')).toEqual({ kind: 'term', id: 'staging-area' });
		expect(parseCourseLink('lesson:ignoring-files')).toEqual({
			kind: 'lesson',
			id: 'ignoring-files'
		});
	});

	it('leaves ordinary addresses alone', () => {
		expect(parseCourseLink('https://git-scm.com/book')).toBeNull();
		expect(parseCourseLink('term:Bad ID')).toBeNull();
	});
});

describe('findCourseLinks', () => {
	it('finds every course link in Markdown, and only those', () => {
		const markdown =
			'See [branch](term:branch), [.gitignore](lesson:ignoring-files) and [Pro Git](https://git-scm.com).';
		expect(findCourseLinks(markdown)).toEqual([
			{ kind: 'term', id: 'branch' },
			{ kind: 'lesson', id: 'ignoring-files' }
		]);
	});
});

describe('courseLinkFallbackHref', () => {
	it('opens a lesson page or the term in the glossary', () => {
		expect(courseLinkFallbackHref({ kind: 'lesson', id: 'ignoring-files' })).toBe(
			'/lessons/ignoring-files'
		);
		expect(courseLinkFallbackHref({ kind: 'term', id: 'branch' })).toBe('/commands/terms#branch');
	});
});

describe('checkCourseLinks', () => {
	const glossary = [{ id: 'branch', term: 'branch', meaning: 'A line of commits.', lessonIds: [] }];

	/**
	 * Builds the lesson map with the sample lesson, its Must know text replaced.
	 * @param mustKnow - the Must know Markdown
	 * @returns the lessons by ID
	 */
	function lessonsWith(mustKnow: string) {
		const lesson = { ...sampleLesson, sections: { ...sampleLesson.sections, mustKnow } };
		return new Map([[lesson.id, lesson]]);
	}

	it('accepts links to existing terms and lessons', () => {
		const lessons = lessonsWith(
			`A [branch](term:branch) and [this lesson](lesson:${sampleLesson.id}).`
		);
		expect(() => checkCourseLinks(lessons, new Map(), glossary)).not.toThrow();
	});

	it('rejects an unknown term or lesson, naming the file', () => {
		expect(() => checkCourseLinks(lessonsWith('[x](term:ghost)'), new Map(), glossary)).toThrow(
			`content/lessons/${sampleLesson.id}/lesson.md: the link "term:ghost" names no glossary term`
		);
		expect(() => checkCourseLinks(lessonsWith('[x](lesson:ghost)'), new Map(), glossary)).toThrow(
			'the link "lesson:ghost" names no lesson'
		);
	});
});
