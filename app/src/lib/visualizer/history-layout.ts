/**
 * history-layout.ts
 * Turns a snapshot into the metro-map history: commits become stations, parent links become
 * track pieces, HEAD and branch names sit on their station, and a faded "next commit" station
 * follows HEAD. ELK (a layout library) then places the stations, oldest on the left.
 * No screen code here, so all of it is tested on its own.
 */

import ELK from 'elkjs/lib/elk.bundled.js';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/** What one station shows. */
export type StationData = {
	shortId: string; // first 7 characters of the commit ID ("" for the next-commit station)
	message: string;
	branchNames: string[]; // local branches pointing here
	isHead: boolean; // HEAD ("you are here") points here
	isNextCommit: boolean; // the faded station for the commit you have not made yet
};

/** A station before layout. */
export type Station = { id: string; data: StationData };

/** A piece of track from a parent commit to its child (older → newer). */
export type Track = { id: string; fromId: string; toId: string; isNextCommit: boolean };

/** The history before layout. */
export type HistoryGraph = { stations: Station[]; tracks: Track[] };

/** A station with its place on the map (top-left corner, in pixels). */
export type PlacedStation = Station & { x: number; y: number };

/** The ID of the faded "next commit" station. */
export const nextCommitId = 'next-commit';

/** Every station's box size, so ELK can keep them apart. */
export const stationSize = { width: 112, height: 88 };

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
			branchNames: snapshot.branches
				.filter((branch) => !branch.isRemote && branch.commitId === commit.id)
				.map((branch) => branch.name),
			isHead: commit.id === headCommitId,
			isNextCommit: false
		}
	}));
	const tracks: Track[] = snapshot.commits.flatMap((commit) =>
		commit.parentIds.map((parentId) => ({
			id: `${parentId}->${commit.id}`,
			fromId: parentId,
			toId: commit.id,
			isNextCommit: false
		}))
	);

	stations.push({
		id: nextCommitId,
		data: {
			shortId: '',
			message: 'your next commit',
			branchNames: [],
			isHead: false,
			isNextCommit: true
		}
	});
	if (headCommitId !== null) {
		tracks.push({
			id: `${headCommitId}->${nextCommitId}`,
			fromId: headCommitId,
			toId: nextCommitId,
			isNextCommit: true
		});
	}
	return { stations, tracks };
}

/**
 * Places the stations with ELK's layered layout, flowing left to right (oldest first).
 * @param graph - the stations and tracks
 * @returns every station with its x and y position
 */
export async function placeStations(graph: HistoryGraph): Promise<PlacedStation[]> {
	const elk = new ELK();
	const knownIds = new Set(graph.stations.map((station) => station.id));
	const layout = await elk.layout({
		id: 'history',
		layoutOptions: {
			'elk.algorithm': 'layered',
			'elk.direction': 'RIGHT',
			'elk.spacing.nodeNode': '24',
			'elk.layered.spacing.nodeNodeBetweenLayers': '40'
		},
		children: graph.stations.map((station) => ({ id: station.id, ...stationSize })),
		// A parent missing from the snapshot (a shallow history) has no station, so skip its track.
		edges: graph.tracks
			.filter((track) => knownIds.has(track.fromId) && knownIds.has(track.toId))
			.map((track) => ({ id: track.id, sources: [track.fromId], targets: [track.toId] }))
	});
	const positions = new Map(
		(layout.children ?? []).map((child) => [child.id, { x: child.x ?? 0, y: child.y ?? 0 }])
	);
	return graph.stations.map((station) => ({
		...station,
		...(positions.get(station.id) ?? { x: 0, y: 0 })
	}));
}
