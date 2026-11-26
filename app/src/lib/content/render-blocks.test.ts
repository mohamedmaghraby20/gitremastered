/**
 * render-blocks.test.ts
 * Tests for splitting lesson Markdown into plain text and special blocks (":::name" markers).
 */

import { describe, expect, it } from 'vitest';
import { splitIntoBlocks } from './render-blocks.ts';

const fileName = 'content/lessons/sample/lesson.md';

describe('splitIntoBlocks', () => {
	it('keeps plain Markdown as one markdown block', () => {
		expect(splitIntoBlocks('Just text.', fileName)).toEqual([
			{ kind: 'markdown', markdown: 'Just text.' }
		]);
	});

	it('cuts text around a block, in order', () => {
		const blocks = splitIntoBlocks('Before.\n\n:::careful\nWatch out.\n:::\n\nAfter.', fileName);
		expect(blocks).toEqual([
			{ kind: 'markdown', markdown: 'Before.' },
			{ kind: 'careful', markdown: 'Watch out.' },
			{ kind: 'markdown', markdown: 'After.' }
		]);
	});

	it('reads "try-it" and "sidenote" as Markdown blocks', () => {
		const tryIt = splitIntoBlocks(':::try-it\n1. Run `git status`.\n:::', fileName);
		const sidenote = splitIntoBlocks(':::sidenote\nA quote.\n:::', fileName);
		expect(tryIt).toEqual([{ kind: 'try-it', markdown: '1. Run `git status`.' }]);
		expect(sidenote).toEqual([{ kind: 'sidenote', markdown: 'A quote.' }]);
	});

	it('reads "definitions" as a list of terms with their area', () => {
		const markdown = [
			':::definitions',
			'- term: Staging area',
			'  area: staging',
			'  text: The next commit.',
			'- term: Commit',
			'  text: A saved snapshot.',
			':::'
		].join('\n');
		expect(splitIntoBlocks(markdown, fileName)).toEqual([
			{
				kind: 'definitions',
				items: [
					{ term: 'Staging area', area: 'staging', text: 'The next commit.' },
					{ term: 'Commit', area: null, text: 'A saved snapshot.' }
				]
			}
		]);
	});

	it('reads "compare" as the today and book cells', () => {
		const markdown = ':::compare\ntoday: "`git restore`"\nbook: "`git checkout --`"\n:::';
		expect(splitIntoBlocks(markdown, fileName)).toEqual([
			{ kind: 'compare', today: '`git restore`', book: '`git checkout --`' }
		]);
	});

	it('reads "predict" as a question and its hidden answer', () => {
		const markdown =
			':::predict\nquestion: "What will git status show?"\nanswer: "Two lists."\n:::';
		expect(splitIntoBlocks(markdown, fileName)).toEqual([
			{ kind: 'predict', question: 'What will git status show?', answer: 'Two lists.' }
		]);
	});

	it('reads "graph" as a commit diagram', () => {
		const markdown = [
			':::graph',
			'caption: After the commit',
			'commits:',
			'  - id: A',
			'    message: Add README',
			'  - id: B',
			'    message: Add notes',
			'    parents: [A]',
			'branches:',
			'  main: B',
			'head: main',
			':::'
		].join('\n');
		expect(splitIntoBlocks(markdown, fileName)).toEqual([
			{
				kind: 'graph',
				graph: {
					caption: 'After the commit',
					commits: [
						{ id: 'A', message: 'Add README', parentIds: [], isFaded: false },
						{ id: 'B', message: 'Add notes', parentIds: ['A'], isFaded: false }
					],
					branches: [{ name: 'main', commitId: 'B' }],
					remoteBranches: [],
					tags: [],
					head: { kind: 'branch', branchName: 'main' }
				}
			}
		]);
	});

	it('rejects a graph whose branch points at a commit that is not drawn', () => {
		const markdown =
			':::graph\ncaption: X\ncommits:\n  - id: A\n    message: M\nbranches:\n  main: Z\n:::';
		expect(() => splitIntoBlocks(markdown, fileName)).toThrow(
			'"branches": "main" points at an unknown commit "Z"'
		);
	});

	it('rejects a graph whose commit names a parent that is not drawn', () => {
		const markdown =
			':::graph\ncaption: X\ncommits:\n  - id: A\n    message: M\n    parents: [Q]\n:::';
		expect(() => splitIntoBlocks(markdown, fileName)).toThrow(
			'commit "A" names an unknown parent "Q"'
		);
	});

	it('ignores markers inside code blocks', () => {
		const markdown = '```\n:::careful\n```';
		expect(splitIntoBlocks(markdown, fileName)).toEqual([{ kind: 'markdown', markdown }]);
	});

	it('rejects an unknown block name', () => {
		expect(() => splitIntoBlocks(':::shiny\nText\n:::', fileName)).toThrow(
			`${fileName}: unknown block ":::shiny"`
		);
	});

	it('rejects a block that is never closed', () => {
		expect(() => splitIntoBlocks(':::careful\nText', fileName)).toThrow(
			'the ":::careful" block is never closed'
		);
	});

	it('rejects a definition with an unknown area', () => {
		const markdown = ':::definitions\n- term: X\n  area: attic\n  text: Y\n:::';
		expect(() => splitIntoBlocks(markdown, fileName)).toThrow(
			'item 1: "area" must be working, staging or repository'
		);
	});
});
