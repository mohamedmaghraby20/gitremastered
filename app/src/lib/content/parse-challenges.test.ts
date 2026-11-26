/**
 * parse-challenges.test.ts
 * Tests for reading challenges.yaml: three or more challenges, easy to hard, each with the
 * mission fields (brief, setup, goals, hints, solution).
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../../tests/fixtures/read-fixture.ts';
import { parseChallengesText } from './parse-challenges.ts';

const fileName = 'content/lessons/sample-lesson/challenges.yaml';
const validChallengesText = readSampleLessonFile('challenges.yaml');

describe('parseChallengesText', () => {
	it('reads every challenge with its level and mission fields', () => {
		const challenges = parseChallengesText(validChallengesText, fileName);
		expect(challenges.map((challenge) => challenge.level)).toEqual(['easy', 'medium', 'hard']);
		const first = challenges[0];
		expect(first.id).toBe('commit-notes');
		expect(first.title).toBe('Commit the notes');
		expect(first.setup).toEqual(['git init', 'echo "draft" > notes.txt']);
		expect(first.goals).toEqual([
			{ check: 'file-is-committed', file: 'notes.txt', label: 'notes.txt is committed' },
			{ check: 'commit-count-at-least', count: 1, label: 'The repo has a commit' }
		]);
		expect(first.hints).toHaveLength(3);
	});

	it('needs at least three challenges', () => {
		const twoChallenges = validChallengesText.slice(
			0,
			validChallengesText.indexOf('  - id: keep-one-out')
		);
		expect(() => parseChallengesText(twoChallenges, fileName)).toThrow('at least 3');
	});

	it('needs them easy to hard', () => {
		// The first challenge becomes hard, so the medium one after it goes back down.
		const backwards = validChallengesText.replace('level: easy', 'level: hard');
		expect(() => parseChallengesText(backwards, fileName)).toThrow('easier than the one before it');
	});

	it('rejects an unknown level or goal check, naming the challenge and goal', () => {
		expect(() =>
			parseChallengesText(validChallengesText.replace('level: easy', 'level: tricky'), fileName)
		).toThrow('challenge 1: "level" must be one of easy, medium, hard');
		expect(() =>
			parseChallengesText(
				validChallengesText.replace('check: file-is-committed', 'check: file-is-shiny'),
				fileName
			)
		).toThrow('challenge 1, goal 1: unknown check "file-is-shiny"');
	});

	it('rejects two challenges with the same id', () => {
		const sameId = validChallengesText.replace('id: commit-two-files', 'id: commit-notes');
		expect(() => parseChallengesText(sameId, fileName)).toThrow(
			'the challenge id "commit-notes" is used twice'
		);
	});

	it('rejects broken YAML', () => {
		expect(() => parseChallengesText('challenges: [', fileName)).toThrow(
			`${fileName}: the YAML could not be read`
		);
	});
});
