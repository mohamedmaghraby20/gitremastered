/**
 * parse-github.test.ts
 * Tests for reading a challenge's `github` field and the content safety rules (A5).
 */

import { describe, expect, it } from 'vitest';
import { FieldReader } from './field-reader.ts';
import { checkGitHubLines, readGitHubChallenge } from './parse-github.ts';

/**
 * Builds a reader for a challenge written as YAML.
 * @param yamlText - the challenge
 * @returns its reader
 */
function challengeReader(yamlText: string): FieldReader {
	return FieldReader.fromYaml(yamlText, 'challenges.yaml');
}

describe('readGitHubChallenge', () => {
	it('reads the repository and the teammate steps', () => {
		const reader = challengeReader(
			[
				'github:',
				'  repo: gitremastered-practice-flow',
				'  teammate:',
				'    - action: open-pull-request',
				'      head: menu',
				'      base: main',
				'      title: Add the menu',
				'    - action: merge-pull-request',
				'      head: menu',
				'      method: squash'
			].join('\n')
		);
		const challenge = readGitHubChallenge(reader.optionalRecord('github'));
		expect(challenge?.repo).toBe('gitremastered-practice-flow');
		expect(challenge?.teammate[1]).toEqual({
			action: 'merge-pull-request',
			head: 'menu',
			method: 'squash'
		});
	});

	it('refuses a repository without the practice prefix', () => {
		const reader = challengeReader('github:\n  repo: my-real-project');
		expect(() => readGitHubChallenge(reader.optionalRecord('github'))).toThrow(
			/gitremastered-practice/
		);
	});

	it('refuses an unknown teammate action', () => {
		const reader = challengeReader(
			'github:\n  repo: gitremastered-practice-x\n  teammate:\n    - action: delete-repo'
		);
		expect(() => readGitHubChallenge(reader.optionalRecord('github'))).toThrow(
			/unknown teammate action/
		);
	});
});

describe('checkGitHubLines', () => {
	const reader = challengeReader('brief: x');

	it('refuses gh and github.com in setup lines', () => {
		expect(() => checkGitHubLines(reader, ['gh repo create x'], [])).toThrow(/setup line/);
		expect(() => checkGitHubLines(reader, ['git clone https://github.com/a/b'], [])).toThrow(
			/setup line/
		);
		expect(() =>
			checkGitHubLines(reader, ['git remote add origin "$PRACTICE_GITHUB_URL"'], [])
		).not.toThrow();
	});

	it('lets a solution use gh, but not on another repository', () => {
		expect(() => checkGitHubLines(reader, [], ['gh pr create --fill'])).not.toThrow();
		expect(() => checkGitHubLines(reader, [], ['gh pr merge --repo me/other'])).toThrow(
			/solution line/
		);
		expect(() => checkGitHubLines(reader, [], ['gh repo delete x --yes'])).toThrow(/solution line/);
	});
});
