/**
 * lane-layout.test.ts
 * Tests for placing commits in columns (age) and lanes (lines of work).
 */

import { describe, expect, it } from 'vitest';
import { placeInLanes, type LaneCommit } from './lane-layout';

/**
 * Builds commits from a short text like "A, B<A, C<B": each commit and its parents.
 * @param text - commits separated by ", "; parents after "<", joined by "+"
 * @returns the commits
 */
function commitsFrom(text: string): LaneCommit[] {
	return text.split(', ').map((part) => {
		const [id, parents] = part.split('<');
		return { id, parentIds: parents === undefined ? [] : parents.split('+') };
	});
}

describe('placeInLanes', () => {
	it('keeps a straight history on one row, oldest on the left', () => {
		const places = placeInLanes(commitsFrom('A, B<A, C<B'), ['C']);
		expect(places.get('A')).toEqual({ column: 0, lane: 0 });
		expect(places.get('B')).toEqual({ column: 1, lane: 0 });
		expect(places.get('C')).toEqual({ column: 2, lane: 0 });
	});

	it('gives a branch that runs beside main its own row', () => {
		const commits = commitsFrom('A, B<A, E<B, C<B, D<C');
		const places = placeInLanes(commits, ['E', 'D']);
		expect(places.get('E')).toEqual({ column: 2, lane: 0 });
		expect(places.get('C')).toEqual({ column: 2, lane: 1 });
		expect(places.get('D')).toEqual({ column: 3, lane: 1 });
	});

	it('keeps a branch that is only ahead of main on the same row', () => {
		// main is at B; feature added C and D on top. Nothing runs side by side.
		const places = placeInLanes(commitsFrom('A, B<A, C<B, D<C'), ['B', 'D']);
		expect(places.get('D')).toEqual({ column: 3, lane: 0 });
	});

	it('puts a merge commit after both of its parents', () => {
		const commits = commitsFrom('A, B<A, C<A, M<B+C');
		const places = placeInLanes(commits, ['M']);
		expect(places.get('M')).toEqual({ column: 2, lane: 0 });
		expect(places.get('B')?.lane).toBe(0);
		expect(places.get('C')).toEqual({ column: 1, lane: 1 });
	});

	it('gives a commit no tip reaches a row of its own beside the history', () => {
		// "Old" was replaced by B (an amend): both are children of A.
		const places = placeInLanes(commitsFrom('A, B<A, Old<A'), ['B']);
		expect(places.get('Old')).toEqual({ column: 1, lane: 1 });
	});

	it('reuses a row once an earlier branch has ended', () => {
		// Two short branches, one after the other, both merged back into main.
		const commits = commitsFrom('A, X<A, B<A, M1<B+X, Y<M1, C<M1, M2<C+Y');
		const places = placeInLanes(commits, ['M2']);
		expect(places.get('X')?.lane).toBe(1);
		expect(places.get('Y')?.lane).toBe(1);
	});

	it('ignores a parent that is not in the list', () => {
		const places = placeInLanes([{ id: 'B', parentIds: ['missing'] }], ['B']);
		expect(places.get('B')).toEqual({ column: 0, lane: 0 });
	});
});
