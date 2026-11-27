/**
 * graph-diagram.ts
 * Turns a ":::graph" lesson block into what the screen draws: each commit with its place in
 * pixels and its labels, the tracks between commits, the diagram's size, and a sentence that
 * describes it for screen readers. No screen code here, so it is tested on its own.
 */

import type { CommitGraph, GraphCommit } from '@gitremastered/course-engine/types/commit-graph';
import { placeInLanes } from './lane-layout';

/** The grid, in pixels: how far apart columns and lanes are, and the room around the rings. */
export const diagramGrid = {
	columnStep: 136, // from one commit's ring to the next one's
	laneStep: 112, // from one row's rings to the next row's
	ringOffsetX: 68, // from the left edge to the first ring's center
	ringOffsetY: 56 // from the top edge to the first row's rings: room for the labels above
};

/** One commit, ready to draw. x and y are the center of its ring. */
export type DiagramCommit = {
	id: string;
	message: string;
	x: number;
	y: number;
	isFaded: boolean;
	isHead: boolean; // HEAD is on this commit (through a branch, or directly)
	isHeadDetached: boolean; // HEAD points straight at this commit
	branchNames: string[];
	remoteBranchNames: string[];
	tagNames: string[];
};

/** A track from a parent to its child, as an SVG path. */
export type DiagramTrack = { id: string; path: string; isFaded: boolean };

/** Everything the diagram component draws. */
export type GraphDiagram = {
	commits: DiagramCommit[];
	tracks: DiagramTrack[];
	width: number;
	height: number;
	description: string;
};

/**
 * Builds the diagram for a graph block.
 * @param graph - the checked block
 * @returns the placed commits, tracks, size and description
 */
export function buildGraphDiagram(graph: CommitGraph): GraphDiagram {
	const headCommitId = findHeadCommitId(graph);
	const tipIds = [...graph.branches, ...graph.remoteBranches, ...graph.tags].map(
		(label) => label.commitId
	);
	const places = placeInLanes(graph.commits, tipIds);

	const commits = graph.commits.map((commit) => {
		const place = places.get(commit.id) ?? { column: 0, lane: 0 };
		return {
			id: commit.id,
			message: commit.message,
			x: diagramGrid.ringOffsetX + place.column * diagramGrid.columnStep,
			y: diagramGrid.ringOffsetY + place.lane * diagramGrid.laneStep,
			isFaded: commit.isFaded,
			isHead: commit.id === headCommitId,
			isHeadDetached: commit.id === headCommitId && graph.head?.kind === 'detached',
			branchNames: namesOn(graph.branches, commit.id),
			remoteBranchNames: namesOn(graph.remoteBranches, commit.id),
			tagNames: namesOn(graph.tags, commit.id)
		};
	});
	const columnCount = Math.max(...[...places.values()].map((place) => place.column)) + 1;
	const laneCount = Math.max(...[...places.values()].map((place) => place.lane)) + 1;
	return {
		commits,
		tracks: buildTracks(graph.commits, commits),
		width: columnCount * diagramGrid.columnStep,
		height: laneCount * diagramGrid.laneStep,
		description: describeGraph(graph)
	};
}

/**
 * Finds the commit HEAD is on.
 * @param graph - the block
 * @returns the commit's ID, or null when the block shows no HEAD
 */
function findHeadCommitId(graph: CommitGraph): string | null {
	const head = graph.head;
	if (head === null) {
		return null;
	}
	if (head.kind === 'detached') {
		return head.commitId;
	}
	return graph.branches.find((branch) => branch.name === head.branchName)?.commitId ?? null;
}

/**
 * Lists the labels of one kind that sit on a commit.
 * @param labels - branches, remote branches or tags
 * @param commitId - the commit
 * @returns the label names
 */
function namesOn(labels: CommitGraph['branches'], commitId: string): string[] {
	return labels.filter((label) => label.commitId === commitId).map((label) => label.name);
}

/**
 * Builds a track for every parent link. A track inside one row is a straight line; a track
 * between rows bends, like a metro line changing level.
 * @param graphCommits - the block's commits, for their parents
 * @param placedCommits - the same commits with their places
 * @returns the tracks
 */
function buildTracks(graphCommits: GraphCommit[], placedCommits: DiagramCommit[]): DiagramTrack[] {
	const placedById = new Map(placedCommits.map((commit) => [commit.id, commit]));
	const tracks: DiagramTrack[] = [];
	for (const commit of graphCommits) {
		const child = placedById.get(commit.id);
		for (const parentId of commit.parentIds) {
			const parent = placedById.get(parentId);
			if (child === undefined || parent === undefined) {
				continue;
			}
			const middleX = (parent.x + child.x) / 2;
			const path =
				parent.y === child.y
					? `M ${parent.x} ${parent.y} L ${child.x} ${child.y}`
					: `M ${parent.x} ${parent.y} C ${middleX} ${parent.y}, ${middleX} ${child.y}, ${child.x} ${child.y}`;
			tracks.push({ id: `${parentId}->${commit.id}`, path, isFaded: child.isFaded });
		}
	}
	return tracks;
}

/**
 * Describes a diagram in plain sentences, for people who cannot see it.
 * @param graph - the block
 * @returns for example "Commits, oldest first: A (Add README), B (Add notes), built on A.
 *   Branch main is on B. HEAD is on main."
 */
export function describeGraph(graph: CommitGraph): string {
	const commitTexts = graph.commits.map((commit) => {
		const builtOn =
			commit.parentIds.length === 0 ? '' : `, built on ${joinNames(commit.parentIds)}`;
		const faded = commit.isFaded ? ', no longer on any branch' : '';
		return `${commit.id} (${commit.message})${builtOn}${faded}`;
	});
	const sentences = [`Commits, oldest first: ${commitTexts.join('; ')}.`];
	for (const branch of graph.branches) {
		sentences.push(`Branch ${branch.name} is on ${branch.commitId}.`);
	}
	for (const remoteBranch of graph.remoteBranches) {
		sentences.push(`Remote-tracking branch ${remoteBranch.name} is on ${remoteBranch.commitId}.`);
	}
	for (const tag of graph.tags) {
		sentences.push(`Tag ${tag.name} is on ${tag.commitId}.`);
	}
	if (graph.head?.kind === 'branch') {
		sentences.push(`HEAD is on ${graph.head.branchName}.`);
	}
	if (graph.head?.kind === 'detached') {
		sentences.push(`HEAD is detached, on commit ${graph.head.commitId}.`);
	}
	return sentences.join(' ');
}

/**
 * Joins names as "A", "A and B" or "A, B and C".
 * @param names - one or more names
 * @returns the joined text
 */
function joinNames(names: string[]): string {
	if (names.length === 1) {
		return names[0];
	}
	return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}
