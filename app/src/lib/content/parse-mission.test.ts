/**
 * parse-mission.test.ts
 * Tests for reading mission.yaml into a typed mission.
 */

import { describe, expect, it } from 'vitest';
import { readSampleLessonFile } from '../../../tests/fixtures/read-fixture.ts';
import { parseMissionText } from './parse-mission.ts';

const fileName = 'content/lessons/sample-lesson/mission.yaml';
const validMissionText = readSampleLessonFile('mission.yaml');

describe('parseMissionText', () => {
	it('reads a valid mission', () => {
		const mission = parseMissionText(validMissionText, fileName);
		expect(mission.brief).toBe('Commit notes.txt.');
		expect(mission.setup).toEqual(['git init', 'echo "draft" > notes.txt']);
		expect(mission.goals).toEqual([
			{ check: 'file-is-committed', file: 'notes.txt', label: 'notes.txt is committed' },
			{ check: 'commit-count-at-least', count: 1, label: 'The repo has a commit' }
		]);
		expect(mission.hints).toHaveLength(3);
		expect(mission.solution).toEqual(['git add notes.txt', 'git commit -m "Add notes"']);
	});

	it('rejects an unknown goal check, naming the goal', () => {
		const unknownCheck = validMissionText.replace(
			'check: file-is-committed',
			'check: file-is-shiny'
		);
		expect(() => parseMissionText(unknownCheck, fileName)).toThrow(
			`${fileName}: goal 1: unknown check "file-is-shiny"`
		);
	});

	it('rejects a file check with no file', () => {
		const noFile = validMissionText.replace('    file: notes.txt\n', '');
		expect(() => parseMissionText(noFile, fileName)).toThrow('goal 1: the "file" field is missing');
	});

	it('rejects a missing hints list', () => {
		const noHints = validMissionText.replace(/hints:[\s\S]*?solution:/, 'solution:');
		expect(() => parseMissionText(noHints, fileName)).toThrow('the "hints" field is missing');
	});

	it('rejects broken YAML', () => {
		expect(() => parseMissionText('setup: [git init', fileName)).toThrow(
			`${fileName}: the YAML could not be read`
		);
	});
});
