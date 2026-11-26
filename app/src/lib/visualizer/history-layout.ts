/**
 * history-layout.ts
 * Turns a snapshot into the metro-map history: commits become stations, parent links become
 * track pieces, HEAD and the branch, remote and tag labels sit on their station, and a faded
 * "next commit" station follows HEAD. lane-layout.ts then gives every station a column (age,
 * oldest on the left) and a lane (one row per line of work).
 * No screen code here, so all of it is tested on its own.
 */

import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { placeInLanes, type LaneCommit } from './lane-layout';

/** What one station shows. */
export type StationData = {
	shortId: string; // first 7 characters of the commit ID ("" for the next-commit station)
	message: string;
	branchNames: string[]; // local branches pointing here
	remoteBranchNames: string[]; // remote-tracking branches pointing here, like origin/main
	tagNames: string[]; // tags pointing here
	isHead: boolean; // HEAD ("you are here") points here
	isHeadDetached: boolean; // HEAD points straight at this commit, not through a branch
	isNextCommit: boolean; // the faded station for the commit you have not made yet
	isUnreachable: boolean; // no branch, tag or HEAD reaches it (after an amend or a reset)
};

/** A station before layout. */
export type Station = { id: string; data: StationData };

/** How a piece of track is drawn: a normal link, the link to the next commit, or a lost one. */
export type TrackKind = 'commit' | 'next-commit' | 'unreachable';

/** A piece of track from a parent commit to its child (older → newer). */
export type Track = { id: string; fromId: string; toId: string; kind: TrackKind };

/** The history before layout. */
export type HistoryGraph = { stations: Station[]; tracks: Track[] };

/** A station with its place on the map (top-left corner, in pixels). */
export type PlacedStation = Station & { x: number; y: number };

/** The ID of the faded "next commit" station. */
export const nextCommitId = 'next-commit';

/** Every station's box size. The labels' area and the ring have fixed heights (CommitStation). */
export const stationSize = { width: 112, height: 124 };

/** How far apart stations sit: from one column to the next, and from one lane to the next. */
export const stationStep = { column: 152, lane: 140 };

/** Branch names that count as the main line, which gets the top row. */
const mainBranchNames = ['main', 'master'];

/**
 * Builds the stations and tracks for a snapshot.
 * @param snapshot - the repo state
 * @returns the history graph, with the next-commit station after HEAD
 */
export function buildHistoryGraph(snapshot: RepoSnapshot): HistoryGraph {
	const headCommitId = snapshot.head.commitId;
	const stations: Station[] = snapshot.commits.map((commit) => ({
		id: commit.id,
		data: {
			shortId: commit.id.slice(0, 7),
			message: commit.message,
			branchNames: branchNamesOn(snapshot, commit.id, false),
			remoteBranchNames: branchNamesOn(snapshot, commit.id, true),
			tagNames: snapshot.tags.filter((tag) => tag.commitId === commit.id).map((tag) => tag.name),
			isHead: commit.id === headCommitId,
			isHeadDetached: commit.id === headCommitId && snapshot.head.kind === 'detached',
			isNextCommit: false,
			isUnreachable: !commit.isReachable
		}
	}));
	const tracks: Track[] = snapshot.commits.flatMap((commit) =>
		commit.parentIds.map((parentId) => ({
			id: `${parentId}->${commit.id}`,
			fromId: parentId,
			toId: commit.id,
			kind: commit.isReachable ? ('commit' as const) : ('unreachable' as const)
		}))
	);

	stations.push({
		id: nextCommitId,
		data: {
			shortId: '',
			message: 'your next commit',
			branchNames: [],
			remoteBranchNames: [],
			tagNames: [],
			isHead: false,
			isHeadDetached: false,
			isNextCommit: true,
			isUnreachable: false
		}
	});
	if (headCommitId !== null) {
		tracks.push({
			id: `${headCommitId}->${nextCommitId}`,
			fromId: headCommitId,
			toId: nextCommitId,
			kind: 'next-commit'
		});
	}
	return { stations, tracks };
}

/**
 * Places the stations: oldest on the left, one row per line of work.
 * @param graph - the stations and tracks
 * @param snapshot - the repo state, for the order of the rows
 * @returns every station with its x and y position
 */
export function placeStations(graph: HistoryGraph, snapshot: RepoSnapshot): PlacedStation[] {
	const knownIds = new Set(graph.stations.map((station) => station.id));
	// A parent missing from the snapshot (a shallow history) has no station, so it is skipped.
	const laneCommits: LaneCommit[] = graph.stations.map((station) => ({
		id: station.id,
		parentIds: graph.tracks
			.filter((track) => track.toId === station.id && knownIds.has(track.fromId))
			.map((track) => track.fromId)
	}));
	const places = placeInLanes(laneCommits, findTipOrder(snapshot));
	return graph.stations.map((station) => {
		const place = places.get(station.id) ?? { column: 0, lane: 0 };
		return {
			...station,
			x: place.column * stationStep.column,
			y: place.lane * stationStep.lane
		};
	});
}

/**
 * Lists the local or the remote-tracking branches that point at a commit.
 * @param snapshot - the repo state
 * @param commitId - the commit
 * @param isRemote - true for remote-tracking branches, false for local ones
 * @returns the branch names
 */
function branchNamesOn(snapshot: RepoSnapshot, commitId: string, isRemote: boolean): string[] {
	return snapshot.branches
		.filter((branch) => branch.isRemote === isRemote && branch.commitId === commitId)
		.map((branch) => branch.name);
}

/**
 * Decides which lines of work get the upper rows. The main branch comes first, so its row
 * stays on top whichever branch you are on; then the next commit (so it sits right after
 * HEAD on HEAD's row); then the other local branches, remote branches and tags.
 * @param snapshot - the repo state
 * @returns the commit IDs to lay out, most important first
 */
function findTipOrder(snapshot: RepoSnapshot): string[] {
	const localBranches = snapshot.branches.filter((branch) => !branch.isRemote);
	const mainBranches = localBranches.filter((branch) => mainBranchNames.includes(branch.name));
	const otherBranches = localBranches.filter((branch) => !mainBranchNames.includes(branch.name));
	const remoteBranches = snapshot.branches.filter((branch) => branch.isRemote);
	const isHeadOnMain =
		snapshot.head.kind === 'branch' && mainBranchNames.includes(snapshot.head.branchName);
	const mainTipIds = mainBranches.map((branch) => branch.commitId);
	const otherTipIds = [...otherBranches, ...remoteBranches, ...snapshot.tags].map(
		(pointer) => pointer.commitId
	);
	// On main, the next commit continues main's row; elsewhere main's own commits come first.
	return isHeadOnMain
		? [nextCommitId, ...mainTipIds, ...otherTipIds]
		: [...mainTipIds, nextCommitId, ...otherTipIds];
}
