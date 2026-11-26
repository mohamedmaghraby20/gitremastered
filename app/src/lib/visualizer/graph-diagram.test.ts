/**
 * graph-diagram.test.ts
 * Tests for turning a ":::graph" block into placed commits, tracks and a description.
 */

import { describe, expect, it } from 'vitest';
import type { CommitGraph } from '$lib/types/commit-graph';
import { buildGraphDiagram, describeGraph, diagramGrid } from './graph-diagram';

/** main has A, B, E; feature forked from B with C; HEAD is on feature. */
const forkedGraph: CommitGraph = {
	caption: 'feature forked from B',
	commits: [
		{ id: 'A', message: 'Add README', parentIds: [], isFaded: false },
		{ id: 'B', message: 'Add notes', parentIds: ['A'], isFaded: false },
		{ id: 'E', message: 'Fix typo', parentIds: ['B'], isFaded: false },
		{ id: 'C', message: 'Start login', parentIds: ['B'], isFaded: false }
	],
	branches: [
		{ name: 'main', commitId: 'E' },
		{ name: 'feature', commitId: 'C' }
	],
	remoteBranches: [{ name: 'origin/main', commitId: 'B' }],
	tags: [{ name: 'v1.0', commitId: 'A' }],
	head: { kind: 'branch', branchName: 'feature' }
};

describe('buildGraphDiagram', () => {
	it('puts the first branch on the top row and the second below it', () => {
		const diagram = buildGraphDiagram(forkedGraph);
		const commitE = diagram.commits.find((commit) => commit.id === 'E');
		const commitC = diagram.commits.find((commit) => commit.id === 'C');
		expect(commitE?.y).toBe(diagramGrid.ringOffsetY);
		expect(commitC?.y).toBe(diagramGrid.ringOffsetY + diagramGrid.laneStep);
		expect(commitC?.x).toBe(commitE?.x);
	});

	it('pins HEAD and every kind of label to its commit', () => {
		const diagram = buildGraphDiagram(forkedGraph);
		const commitC = diagram.commits.find((commit) => commit.id === 'C');
		const commitB = diagram.commits.find((commit) => commit.id === 'B');
		const commitA = diagram.commits.find((commit) => commit.id === 'A');
		expect(commitC).toMatchObject({
			isHead: true,
			isHeadDetached: false,
			branchNames: ['feature']
		});
		expect(commitB?.remoteBranchNames).toEqual(['origin/main']);
		expect(commitA?.tagNames).toEqual(['v1.0']);
	});

	it('draws one track per parent link and sizes the diagram to its grid', () => {
		const diagram = buildGraphDiagram(forkedGraph);
		expect(diagram.tracks.map((track) => track.id)).toEqual(['A->B', 'B->E', 'B->C']);
		expect(diagram.width).toBe(3 * diagramGrid.columnStep);
		expect(diagram.height).toBe(2 * diagramGrid.laneStep);
	});

	it('marks a detached HEAD on its commit', () => {
		const detachedGraph: CommitGraph = {
			...forkedGraph,
			head: { kind: 'detached', commitId: 'A' }
		};
		const commitA = buildGraphDiagram(detachedGraph).commits.find((commit) => commit.id === 'A');
		expect(commitA).toMatchObject({ isHead: true, isHeadDetached: true });
	});
});

describe('describeGraph', () => {
	it('describes commits, labels and HEAD in sentences', () => {
		expect(describeGraph(forkedGraph)).toBe(
			'Commits, oldest first: A (Add README); B (Add notes), built on A; ' +
				'E (Fix typo), built on B; C (Start login), built on B. ' +
				'Branch main is on E. Branch feature is on C. ' +
				'Remote-tracking branch origin/main is on B. Tag v1.0 is on A. HEAD is on feature.'
		);
	});

	it('says when a commit is on no branch and when a merge has two parents', () => {
		const graph: CommitGraph = {
			caption: 'x',
			commits: [
				{ id: 'A', message: 'One', parentIds: [], isFaded: false },
				{ id: 'B', message: 'Two', parentIds: [], isFaded: true },
				{ id: 'M', message: 'Merge', parentIds: ['A', 'B'], isFaded: false }
			],
			branches: [],
			remoteBranches: [],
			tags: [],
			head: { kind: 'detached', commitId: 'M' }
		};
		expect(describeGraph(graph)).toBe(
			'Commits, oldest first: A (One); B (Two), no longer on any branch; ' +
				'M (Merge), built on A and B. HEAD is detached, on commit M.'
		);
	});
});
