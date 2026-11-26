/**
 * search-items.test.ts
 * Tests for searching and ranking, with the real course content, plus a speed check on an
 * index much larger than the full course.
 */

import { describe, expect, it } from 'vitest';
import { courseSearchIndex } from './course-search';
import { findGitCommands, toPlainText, type SearchItem } from './search-index';
import { groupResults, moveHighlight, searchItems } from './search-items';

describe('searchItems with the real course', () => {
	it('finds a lesson by its title (SPEC §10 item 9)', () => {
		const results = searchItems(courseSearchIndex, 'ignore files');
		expect(results[0].kind).toBe('lesson');
		expect(results[0].id).toBe('ignoring-files');
	});

	it('finds a lesson by a command it uses (SPEC §10 item 9)', () => {
		const lessonIds = searchItems(courseSearchIndex, 'check-ignore')
			.filter((item) => item.kind === 'lesson')
			.map((item) => item.id);
		expect(lessonIds).toContain('ignoring-files');
	});

	it('finds commands, terms and Pro Git sections', () => {
		const kinds = new Set(searchItems(courseSearchIndex, 'staging').map((item) => item.kind));
		// "Interactive Staging" (Pro Git 7.2) is a book section since phase 6.
		expect(kinds).toEqual(new Set(['command', 'term', 'book']));
		expect(
			searchItems(courseSearchIndex, 'recording changes').some((item) => item.kind === 'book')
		).toBe(true);
	});

	it('needs every typed word to match, and finds nothing for an empty query', () => {
		expect(searchItems(courseSearchIndex, 'staging zebra')).toEqual([]);
		expect(searchItems(courseSearchIndex, '   ')).toEqual([]);
	});

	it('ranks a title match above a text-only match', () => {
		const results = searchItems(courseSearchIndex, 'commit');
		const commandResult = results.findIndex((item) => item.kind === 'term' && item.id === 'commit');
		const lessonOnlyInText = results.findIndex((item) => item.id === 'ignoring-files');
		expect(commandResult).toBeGreaterThanOrEqual(0);
		expect(commandResult).toBeLessThan(lessonOnlyInText === -1 ? Infinity : lessonOnlyInText);
	});

	it('searches 2,000 items in under 50 ms', () => {
		const bigIndex: SearchItem[] = Array.from({ length: 2000 }, (_, itemNumber) => ({
			...courseSearchIndex[itemNumber % courseSearchIndex.length],
			id: `item-${itemNumber}`
		}));
		const startTime = performance.now();
		searchItems(bigIndex, 'stage commit');
		expect(performance.now() - startTime).toBeLessThan(50);
	});
});

describe('groupResults', () => {
	it('groups by kind in a fixed order and can keep only the top few', () => {
		const groups = groupResults(searchItems(courseSearchIndex, 'git'), 2);
		expect(groups.map((group) => group.heading)).toEqual([
			'Lessons',
			'Commands',
			'Terms',
			'Pro Git'
		]);
		expect(groups.every((group) => group.items.length <= 2)).toBe(true);
	});
});

describe('moveHighlight', () => {
	it('moves down and up, wrapping at both ends', () => {
		expect(moveHighlight(-1, 'ArrowDown', 3)).toBe(0);
		expect(moveHighlight(2, 'ArrowDown', 3)).toBe(0);
		expect(moveHighlight(0, 'ArrowUp', 3)).toBe(2);
		expect(moveHighlight(1, 'Enter', 3)).toBeNull();
		expect(moveHighlight(0, 'ArrowDown', 0)).toBeNull();
	});
});

describe('index helpers', () => {
	it('finds the git commands a text mentions, once each', () => {
		expect(findGitCommands('Run `git add` then git commit, then git add again.')).toEqual([
			'git add',
			'git commit'
		]);
	});

	it('strips Markdown marks for result lines', () => {
		expect(toPlainText('Learn `git add`\n**today**')).toBe('Learn git add today');
	});
});
