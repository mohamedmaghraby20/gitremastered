/**
 * parse-reference.test.ts
 * Tests for reading a command page and the glossary.
 */

import { describe, expect, it } from 'vitest';
import { parseCommandPageText, parseGlossaryText } from './parse-reference.ts';

const commandFileName = 'content/commands/git-status.md';
const validCommandText = `---
id: git-status
command: git status
group: Daily loop
summary: Shows which files changed and which are staged.
usage: ["git status", "git status -s"]
bookSection: "2.2 Recording Changes to the Repository"
bookUrl: https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
lessons: [three-areas]
---

Lists your files by area.

:::careful
It never changes anything.
:::
`;

const glossaryFileName = 'content/glossary.yaml';
const validGlossaryText = `terms:
  - id: staging-area
    term: staging area
    meaning: The changes picked for the next commit.
    lessons: [three-areas]
`;

describe('parseCommandPageText', () => {
	it('reads the frontmatter and keeps the explanation as Markdown', () => {
		const commandPage = parseCommandPageText(validCommandText, commandFileName);
		expect(commandPage.command).toBe('git status');
		expect(commandPage.usage).toEqual(['git status', 'git status -s']);
		expect(commandPage.lessonIds).toEqual(['three-areas']);
		expect(commandPage.body).toContain(':::careful');
	});

	it('rejects a page without an explanation', () => {
		const emptyBody = validCommandText.slice(0, validCommandText.lastIndexOf('---') + 4);
		expect(() => parseCommandPageText(emptyBody, commandFileName)).toThrow(
			'the explanation after the frontmatter is empty'
		);
	});

	it('rejects a broken block in the explanation', () => {
		const brokenBlock = validCommandText.replace(':::careful', ':::shiny');
		expect(() => parseCommandPageText(brokenBlock, commandFileName)).toThrow('unknown block');
	});

	it('rejects a missing field', () => {
		const noGroup = validCommandText.replace('group: Daily loop\n', '');
		expect(() => parseCommandPageText(noGroup, commandFileName)).toThrow(
			'"group" field is missing'
		);
	});
});

describe('parseGlossaryText', () => {
	it('reads every term', () => {
		expect(parseGlossaryText(validGlossaryText, glossaryFileName)).toEqual([
			{
				id: 'staging-area',
				term: 'staging area',
				meaning: 'The changes picked for the next commit.',
				lessonIds: ['three-areas']
			}
		]);
	});

	it('rejects a term without a meaning', () => {
		const noMeaning = validGlossaryText.replace(
			'    meaning: The changes picked for the next commit.\n',
			''
		);
		expect(() => parseGlossaryText(noMeaning, glossaryFileName)).toThrow(
			'term 1: the "meaning" field is missing'
		);
	});
});
