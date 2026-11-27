/**
 * parse-lesson.test.ts
 * Tests for reading lesson.md: its frontmatter, its lede and its four sections.
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../tests/fixtures/read-fixture.ts';
import { ContentError } from './content-error.ts';
import { parseLessonText } from './parse-lesson.ts';

const fileName = 'content/lessons/sample-lesson/lesson.md';
const validLessonText = readSampleLessonFile('lesson.md');

describe('parseLessonText', () => {
	it('reads the frontmatter into typed fields', () => {
		const lessonText = parseLessonText(validLessonText, fileName);
		expect(lessonText.frontmatter).toEqual({
			id: 'sample-lesson',
			title: 'A sample lesson',
			module: 'daily-loop',
			bookSection: '2.2 Recording Changes',
			bookUrl: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
			bookSources: ['vendor/progit2/book/02-git-basics/sections/recording-changes.asc'],
			readFirst: ['start-a-repo'],
			isCheckpoint: false
		});
	});

	it('reads the lede and all four sections', () => {
		const lessonText = parseLessonText(validLessonText, fileName);
		expect(lessonText.lede).toBe('This sentence is the lede.');
		expect(lessonText.sections.mustKnow).toContain('Run `git status`');
		expect(lessonText.sections.underTheHood).toBe('Git keeps three areas.');
		expect(lessonText.sections.advanced).toBe('Use `git status -s` for a short view.');
		expect(lessonText.sections.recap).toBe('- Status shows the three areas.');
	});

	it('ignores "##" lines inside code blocks', () => {
		const lessonText = parseLessonText(validLessonText, fileName);
		expect(lessonText.sections.mustKnow).toContain('## this line is inside a code block');
	});

	it('reads files saved with Windows line endings', () => {
		const windowsText = validLessonText.replaceAll('\n', '\r\n');
		const lessonText = parseLessonText(windowsText, fileName);
		expect(lessonText.sections.recap).toBe('- Status shows the three areas.');
	});

	it('rejects a lesson with a missing section, naming the file and the section', () => {
		const withoutPro = validLessonText.replace('## Advanced', '### Advanced');
		expect(() => parseLessonText(withoutPro, fileName)).toThrow(ContentError);
		expect(() => parseLessonText(withoutPro, fileName)).toThrow(
			`${fileName}: the "## Advanced" section is missing`
		);
	});

	it('rejects sections in the wrong order', () => {
		const swapped = validLessonText
			.replace('## Advanced', '## TEMP')
			.replace('## Under the hood', '## Advanced')
			.replace('## TEMP', '## Under the hood');
		expect(() => parseLessonText(swapped, fileName)).toThrow('sections must be in this order');
	});

	it('rejects an unknown section', () => {
		const withExtra = validLessonText.replace('## Recap', '## Extra\n\nText.\n\n## Recap');
		expect(() => parseLessonText(withExtra, fileName)).toThrow('unknown section "## Extra"');
	});

	it('rejects a missing frontmatter field', () => {
		const withoutTitle = validLessonText.replace('title: "A sample lesson"\n', '');
		expect(() => parseLessonText(withoutTitle, fileName)).toThrow(
			`${fileName}: the "title" field is missing`
		);
	});

	it('accepts a link to GitHub Docs, for lessons beyond the book', () => {
		const githubDocs = validLessonText.replace(
			'bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
			'bookUrl: https://docs.github.com/en/pull-requests'
		);
		expect(parseLessonText(githubDocs, fileName).frontmatter.bookUrl).toBe(
			'https://docs.github.com/en/pull-requests'
		);
	});

	it('rejects a book link on any other site', () => {
		const otherSite = validLessonText.replace(
			'bookUrl: https://git-scm.com/',
			'bookUrl: http://example.com/'
		);
		expect(() => parseLessonText(otherSite, fileName)).toThrow(
			`${fileName}: "bookUrl" must start with https://git-scm.com/ or https://docs.github.com/`
		);
	});

	it('rejects broken YAML in the frontmatter', () => {
		const brokenYaml = validLessonText.replace(
			'readFirst: [start-a-repo]',
			'readFirst: [start-a-repo'
		);
		expect(() => parseLessonText(brokenYaml, fileName)).toThrow(
			`${fileName}: the YAML could not be read`
		);
	});

	it('rejects a file with no frontmatter', () => {
		expect(() => parseLessonText('## Must know\n\nText', fileName)).toThrow(
			'must start with frontmatter'
		);
	});

	it('rejects a lesson with no lede', () => {
		const withoutLede = validLessonText.replace('This sentence is the lede.', '');
		expect(() => parseLessonText(withoutLede, fileName)).toThrow('the lede is missing');
	});
});
