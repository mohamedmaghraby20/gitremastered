/**
 * describe-practice.test.ts
 * Tests for the home screen's one-sentence summary of the practice repository.
 */

import { describe, expect, it } from 'vitest';
import type { DeskZones, FileSheetInfo } from '$lib/visualizer/area-zones';
import { describePracticeState } from './describe-practice';

/**
 * Builds desk zones with the given file names.
 * @param working - files in the working tree
 * @param staging - files in the staging area
 * @returns the zones, with an empty repository
 */
function zonesWith(working: string[], staging: string[]): DeskZones {
	const sheet = (path: string): FileSheetInfo => ({ path, label: 'edited' });
	return {
		working: working.map(sheet),
		staging: staging.map(sheet),
		repository: { commitCount: 1, latestCommits: [] }
	};
}

describe('describePracticeState', () => {
	it('names a single staged file first', () => {
		expect(describePracticeState(zonesWith(['README.md'], ['notes.txt']))).toBe(
			'notes.txt is staged but not committed yet.'
		);
	});

	it('counts several staged files', () => {
		expect(describePracticeState(zonesWith([], ['a.txt', 'b.txt']))).toBe(
			'2 files are staged but not committed yet.'
		);
	});

	it('names unstaged changes when nothing is staged', () => {
		expect(describePracticeState(zonesWith(['README.md'], []))).toBe(
			'README.md has changes that are not staged yet.'
		);
	});

	it('says the working tree is clean when nothing waits', () => {
		expect(describePracticeState(zonesWith([], []))).toBe(
			'Everything is committed: the working tree is clean.'
		);
	});
});
