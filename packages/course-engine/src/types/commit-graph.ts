/**
 * commit-graph.ts
 * The shape of a ":::graph" lesson block: a small commit diagram an author draws by hand,
 * shown in the history map's style (teaching rule 17 in docs/writing-lessons.md).
 */

/** One commit in the diagram. */
export type GraphCommit = {
	id: string; // a short name the author picks, like "A" or "C2"; shown under the commit
	message: string;
	parentIds: string[]; // none for the first commit, two for a merge
	isFaded: boolean; // true for a commit no branch reaches any more (after amend or reset)
};

/** A label pinned to a commit: a branch, a remote-tracking branch or a tag. */
export type GraphLabel = { name: string; commitId: string };

/** Where HEAD is in the diagram: on a branch, or straight on a commit ("detached"). */
export type GraphHead =
	{ kind: 'branch'; branchName: string } | { kind: 'detached'; commitId: string };

/** A whole diagram. */
export type CommitGraph = {
	caption: string; // one sentence under the diagram
	commits: GraphCommit[];
	branches: GraphLabel[]; // local branches, in the order their rows should appear
	remoteBranches: GraphLabel[]; // like origin/main
	tags: GraphLabel[];
	head: GraphHead | null; // null when the diagram does not show HEAD
};
