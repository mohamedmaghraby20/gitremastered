/**
 * parse-graph-block.ts
 * Reads the YAML inside a ":::graph" lesson block into a CommitGraph, and checks it makes
 * sense: commit IDs are unique, every parent and every label points at a commit that exists.
 *
 *   :::graph
 *   caption: "After git commit, main moves to the new commit"
 *   commits:
 *     - id: A
 *       message: Add README
 *     - id: B
 *       message: Add notes
 *       parents: [A]
 *   branches:
 *     main: B
 *   head: main
 *   :::
 *
 * Optional fields: "remotes" (like origin/main: A), "tags" (like v1.0: A), and on a commit
 * "faded: true" for a commit no branch reaches any more.
 */

import type { CommitGraph, GraphCommit, GraphHead, GraphLabel } from '../types/commit-graph.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads a graph block.
 * @param body - the YAML between the markers
 * @param blockFileName - the file and block, for error messages
 * @returns the checked diagram
 * @throws ContentError naming the file and the problem
 */
export function parseGraphBlock(body: string, blockFileName: string): CommitGraph {
	const reader = FieldReader.fromYaml(body, blockFileName);
	const commits = reader.recordList('commits', 'commit').map(readCommit);
	const commitIds = new Set<string>();
	for (const commit of commits) {
		if (commitIds.has(commit.id)) {
			reader.fail(`the commit id "${commit.id}" is used twice`);
		}
		commitIds.add(commit.id);
	}
	checkParentsExist(commits, commitIds, reader);

	const branches = readLabels(reader, 'branches', commitIds);
	return {
		caption: reader.text('caption'),
		commits,
		branches,
		remoteBranches: readLabels(reader, 'remotes', commitIds),
		tags: readLabels(reader, 'tags', commitIds),
		head: readHead(reader, branches, commitIds)
	};
}

/**
 * Reads one commit of the diagram.
 * @param commitReader - a reader for one item of "commits"
 * @returns the commit
 */
function readCommit(commitReader: FieldReader): GraphCommit {
	return {
		id: commitReader.text('id'),
		message: commitReader.text('message'),
		parentIds: commitReader.optionalTextList('parents'),
		isFaded: commitReader.optionalFlag('faded')
	};
}

/**
 * Checks that every parent names a commit of the diagram.
 * @param commits - the diagram's commits
 * @param commitIds - their IDs
 * @param reader - the block's reader, for the error message
 */
function checkParentsExist(
	commits: GraphCommit[],
	commitIds: Set<string>,
	reader: FieldReader
): void {
	for (const commit of commits) {
		for (const parentId of commit.parentIds) {
			if (!commitIds.has(parentId)) {
				reader.fail(`commit "${commit.id}" names an unknown parent "${parentId}"`);
			}
		}
	}
}

/**
 * Reads one kind of label ("branches", "remotes" or "tags") and checks its commits exist.
 * @param reader - the block's reader
 * @param fieldName - which labels to read
 * @param commitIds - the diagram's commit IDs
 * @returns the labels, in file order
 */
function readLabels(reader: FieldReader, fieldName: string, commitIds: Set<string>): GraphLabel[] {
	return reader.optionalTextMap(fieldName).map(({ name, value }) => {
		if (!commitIds.has(value)) {
			reader.fail(`"${fieldName}": "${name}" points at an unknown commit "${value}"`);
		}
		return { name, commitId: value };
	});
}

/**
 * Reads where HEAD is: the name of a branch, or the ID of a commit (a detached HEAD).
 * @param reader - the block's reader
 * @param branches - the diagram's local branches
 * @param commitIds - the diagram's commit IDs
 * @returns HEAD's place, or null when the block has no "head"
 */
function readHead(
	reader: FieldReader,
	branches: GraphLabel[],
	commitIds: Set<string>
): GraphHead | null {
	const headText = reader.optionalText('head');
	if (headText === null) {
		return null;
	}
	if (branches.some((branch) => branch.name === headText)) {
		return { kind: 'branch', branchName: headText };
	}
	if (commitIds.has(headText)) {
		return { kind: 'detached', commitId: headText };
	}
	reader.fail(`"head" must name a branch or a commit of the diagram, found "${headText}"`);
}
