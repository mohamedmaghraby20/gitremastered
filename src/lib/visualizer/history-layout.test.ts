/**
 * history-layout.test.ts
 * Tests for building and placing the metro-map history.
 */

import { describe, expect, it } from 'vitest';
import {
	localBranch,
	remoteBranch,
	sampleCommit,
	snapshotWith
} from '@gitremastered/course-engine/types/snapshot-samples';
import {
	buildHistoryGraph,
	nextCommitId,
	placeStations,
	stationStep,
	type PlacedStation
} from './history-layout';

const firstId = 'a'.repeat(40);
const secondId = 'b'.repeat(40);
const mainId = 'c'.repeat(40);
const featureId = 'd'.repeat(40);

/** A repo with two commits on main and HEAD on the newest. */
const twoCommitSnapshot = snapshotWith({
	commits: [sampleCommit(secondId, 'Add notes', [firstId]), sampleCommit(firstId, 'Add README')],
	branches: [localBranch('main', secondId)],
	head: { kind: 'branch', branchName: 'main', commitId: secondId }
});

/** main and feature both added a commit on top of the second one. HEAD is on feature. */
const forkedSnapshot = snapshotWith({
	commits: [
		sampleCommit(featureId, 'Start login', [secondId]),
		sampleCommit(mainId, 'Fix typo', [secondId]),
		...twoCommitSnapshot.commits
	],
	branches: [
		localBranch('main', mainId),
		localBranch('feature', featureId),
		remoteBranch('origin/main', secondId)
	],
	tags: [{ name: 'v1.0', commitId: firstId, isAnnotated: false }],
	head: { kind: 'branch', branchName: 'feature', commitId: featureId }
});

/**
 * Places a snapshot's stations and gives a lookup by ID.
 * @param snapshot - the repo state
 * @returns a function that finds a placed station
 */
function placeSnapshot(snapshot: typeof twoCommitSnapshot): (id: string) => PlacedStation {
	const placed = placeStations(buildHistoryGraph(snapshot), snapshot);
	return (id) => placed.find((station) => station.id === id) as PlacedStation;
}

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
			remoteBranchNames: [],
			tagNames: [],
			isHead: true,
			isHeadDetached: false,
			isNextCommit: false,
			isUnreachable: false
		});
	});

	it('pins remote branches and tags to their commits', () => {
		const stations = buildHistoryGraph(forkedSnapshot).stations;
		const dataOf = (id: string) => stations.find((station) => station.id === id)?.data;
		expect(dataOf(secondId)?.remoteBranchNames).toEqual(['origin/main']);
		expect(dataOf(firstId)?.tagNames).toEqual(['v1.0']);
		expect(dataOf(featureId)?.branchNames).toEqual(['feature']);
	});

	it('marks a detached HEAD on its commit', () => {
		const detached = snapshotWith({
			...twoCommitSnapshot,
			head: { kind: 'detached', commitId: firstId }
		});
		const oldest = buildHistoryGraph(detached).stations[1];
		expect(oldest.data).toMatchObject({ isHead: true, isHeadDetached: true });
	});

	it('marks a commit no branch reaches, and draws its track as lost', () => {
		const lostId = 'e'.repeat(40);
		const amended = snapshotWith({
			...twoCommitSnapshot,
			commits: [sampleCommit(lostId, 'Add ntoes', [firstId], false), ...twoCommitSnapshot.commits]
		});
		const graph = buildHistoryGraph(amended);
		expect(graph.stations[0].data.isUnreachable).toBe(true);
		expect(graph.tracks[0]).toMatchObject({ toId: lostId, kind: 'unreachable' });
	});

	it('links parent to child, and HEAD to the next commit', () => {
		const tracks = buildHistoryGraph(twoCommitSnapshot).tracks;
		expect(tracks.map((track) => [track.fromId, track.toId, track.kind])).toEqual([
			[firstId, secondId, 'commit'],
			[secondId, nextCommitId, 'next-commit']
		]);
	});

	it('shows only the next-commit station in an empty repo', () => {
		const graph = buildHistoryGraph(snapshotWith({}));
		expect(graph.stations.map((station) => station.id)).toEqual([nextCommitId]);
		expect(graph.tracks).toEqual([]);
	});
});

describe('placeStations', () => {
	it('draws a linear history oldest to newest, left to right, on one row', () => {
		const stationOf = placeSnapshot(twoCommitSnapshot);

		expect(stationOf(firstId).x).toBeLessThan(stationOf(secondId).x);
		expect(stationOf(secondId).x).toBeLessThan(stationOf(nextCommitId).x);
		expect(stationOf(firstId).y).toBe(stationOf(secondId).y);
		expect(stationOf(nextCommitId).y).toBe(stationOf(secondId).y);
	});

	it('keeps main on the top row and gives a branch beside it the next row', () => {
		const stationOf = placeSnapshot(forkedSnapshot);

		expect(stationOf(mainId).y).toBe(0);
		expect(stationOf(featureId).y).toBe(stationStep.lane);
		// Both were built on the second commit, so they sit in the same column.
		expect(stationOf(featureId).x).toBe(stationOf(mainId).x);
	});

	it('puts the next commit after HEAD, on the row of the branch you are on', () => {
		const stationOf = placeSnapshot(forkedSnapshot);

		expect(stationOf(nextCommitId).y).toBe(stationOf(featureId).y);
		expect(stationOf(nextCommitId).x).toBe(stationOf(featureId).x + stationStep.column);
	});

	it('keeps a branch that is only ahead of main on main’s row', () => {
		const ahead = snapshotWith({
			commits: [sampleCommit(featureId, 'Start login', [secondId]), ...twoCommitSnapshot.commits],
			branches: [localBranch('main', secondId), localBranch('feature', featureId)],
			head: { kind: 'branch', branchName: 'feature', commitId: featureId }
		});
		const stationOf = placeSnapshot(ahead);

		expect(stationOf(featureId).y).toBe(0);
		expect(stationOf(nextCommitId).y).toBe(0);
	});

	it('moves the next commit to its own row when HEAD is detached on an old commit', () => {
		const detached = snapshotWith({
			...twoCommitSnapshot,
			head: { kind: 'detached', commitId: firstId }
		});
		const stationOf = placeSnapshot(detached);

		// The second commit already sits right after the first, so the next commit goes below it.
		expect(stationOf(nextCommitId).x).toBe(stationOf(secondId).x);
		expect(stationOf(nextCommitId).y).toBe(stationStep.lane);
	});
});
