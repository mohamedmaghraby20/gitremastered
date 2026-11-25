/**
 * explain-command.test.ts
 * Tests for the one-sentence captions of the pilot's commands.
 */

import { describe, expect, it } from 'vitest';
import { explainCommand } from './explain-command';

describe('explainCommand', () => {
	it('says git status only looks', () => {
		expect(explainCommand('git status')?.explanation).toMatch(/only looks/);
	});

	it('names the file git add moved to the staging area', () => {
		expect(explainCommand('git add notes.txt')).toEqual({
			commandLine: 'git add notes.txt',
			explanation: 'notes.txt moved to the staging area. Commit to save a snapshot.'
		});
	});

	it('says "every change" for git add .', () => {
		expect(explainCommand('git add .')?.explanation).toMatch(/^Every change moved/);
	});

	it('explains git commit, and git commit -a differently', () => {
		expect(explainCommand('git commit -m "Add notes"')?.explanation).toMatch(
			/staging area was saved as a new commit/
		);
		expect(explainCommand('git commit -am "Fix"')?.explanation).toMatch(/Every change to tracked/);
	});

	it('tells git restore --staged apart from git restore', () => {
		expect(explainCommand('git restore --staged notes.txt')?.explanation).toMatch(
			/left the staging area/
		);
		expect(explainCommand('git restore notes.txt')?.explanation).toMatch(/The edit is gone/);
	});

	it('ignores empty lines and commands that are not Git', () => {
		expect(explainCommand('   ')).toBeNull();
		expect(explainCommand('ls -la')).toBeNull();
	});
});
