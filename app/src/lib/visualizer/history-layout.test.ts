/**
 * history-layout.test.ts
 * Tests for building and placing the metro-map history.
 */

import { describe, expect, it } from 'vitest';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { buildHistoryGraph, nextCommitId, placeStations } from './history-layout';

const firstId = 'a'.repeat(40);
const secondId = 'b'.repeat(40);

/** A repo with two commits on main and HEAD on the newest. */
const twoCommitSnapshot: RepoSnapshot = {
	commits: [
		{
			id: secondId,
			message: 'Add notes',
			parentIds: [firstId],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:05:00+00:00'
		},
		{
			id: firstId,
			message: 'Add README',
			parentIds: [],
			authorName: 'Student',
			authoredAt: '2026-11-25T10:00:00+00:00'
		}
	],
	branches: [{ name: 'main', commitId: secondId, isRemote: false }],
	tags: [],
	head: { kind: 'branch', branchName: 'main', commitId: secondId },
	stagedFiles: [],
	modifiedFiles: [],
	untrackedFiles: [],
	committedFiles: []
};

describe('buildHistoryGraph', () => {
	it('makes one station per commit plus the next-commit station', () => {
		const graph = buildHistoryGraph(twoCommitSnapshot);
		const stationIds = graph.stations.map((station) => station.id);
		expect(stationIds).toEqual([secondId, firstId, nextCommitId]);
	});

	it('puts HEAD and the branch label on the newest commit', () => {
		const newest = buildHistoryGraph(twoCommitSnapshot).stations[0];
		expect(newest.data).toEqual({
			shortId: 'bbbbbbb',
			message: 'Add notes',
			branchNames: ['main'],
			isHead: true,
			isNextCommit: false
		});
	});

	it('links parent to child, and HEAD to the next commit', () => {
		const tracks = buildHistoryGraph(twoCommitSnapshot).tracks;
		expect(tracks.map((track) => [track.fromId, track.toId, track.isNextCommit])).toEqual([
			[firstId, secondId, false],
			[secondId, nextCommitId, true]
		]);
	});

	it('shows only the next-commit station in an empty repo', () => {
		const graph = buildHistoryGraph({
			...twoCommitSnapshot,
			commits: [],
			branches: [],
			head: {
				kind: 'branch',
				branchName: 'main',
				commitId: null
			}
		});
		expect(graph.stations.map((station) => station.id)).toEqual([nextCommitId]);
		expect(graph.tracks).toEqual([]);
	});
});

describe('placeStations', () => {
	it('draws a linear history oldest to newest, left to right, on one line', async () => {
		const placed = await placeStations(buildHistoryGraph(twoCommitSnapshot));
		const xOf = (id: string) => placed.find((station) => station.id === id)?.x ?? NaN;
		const yOf = (id: string) => placed.find((station) => station.id === id)?.y ?? NaN;

		expect(xOf(firstId)).toBeLessThan(xOf(secondId));
		expect(xOf(secondId)).toBeLessThan(xOf(nextCommitId));
		expect(yOf(firstId)).toBe(yOf(secondId));
	});
});
