/**
 * history-view.test.ts
 * Tests for choosing the history map's view: a short history is shown whole, a long one
 * follows HEAD at a readable zoom.
 */

import { describe, expect, it } from 'vitest';
import type { PlacedStation } from './history-layout';
import { chooseHistoryView, followZoom } from './history-view';

/**
 * Places a row of commit stations, oldest on the left, with HEAD on the newest and the
 * next-commit station after it (like the real layout: 112 px stations, 40 px apart).
 * @param commitCount - how many commits
 * @returns the stations
 */
function rowOfStations(commitCount: number): PlacedStation[] {
	const stations: PlacedStation[] = [];
	for (let index = 0; index <= commitCount; index += 1) {
		const isNextCommit = index === commitCount;
		stations.push({
			id: isNextCommit ? 'next-commit' : `commit-${index}`,
			x: index * 152,
			y: 0,
			data: {
				shortId: isNextCommit ? '' : `c${index}`,
				message: '',
				branchNames: [],
				isHead: index === commitCount - 1,
				isNextCommit
			}
		});
	}
	return stations;
}

const mapArea = { width: 700, height: 300 };

describe('chooseHistoryView', () => {
	it('shows a short history whole', () => {
		expect(chooseHistoryView(rowOfStations(2), mapArea)).toEqual({ kind: 'fit-all' });
	});

	it('follows HEAD and the next commit at a readable zoom when the history is long', () => {
		const view = chooseHistoryView(rowOfStations(25), mapArea);
		expect(view.kind).toBe('center');
		if (view.kind === 'center') {
			expect(view.zoom).toBe(followZoom);
			// Halfway between HEAD (commit 24, x 3648) and the next-commit station (x 3800).
			expect(view.x).toBe((24 * 152 + 25 * 152 + 112) / 2);
		}
	});

	it('fits when there is nothing to measure yet', () => {
		expect(chooseHistoryView([], mapArea)).toEqual({ kind: 'fit-all' });
		expect(chooseHistoryView(rowOfStations(25), { width: 0, height: 0 })).toEqual({
			kind: 'fit-all'
		});
	});
});
