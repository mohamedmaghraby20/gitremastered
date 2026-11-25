/**
 * repo-snapshot.ts
 * The state of a practice repository at one moment (SPEC.md section 3.4).
 * Mirrors app/src-tauri/src/models/repo_snapshot.rs; a Rust test checks the JSON names match.
 */

/** The state of the practice repository at one moment. */
export type RepoSnapshot = {
	commits: Commit[]; // every reachable commit, newest first
	branches: Branch[]; // local and remote-tracking branches
	tags: Tag[];
	head: HeadState; // which branch or commit HEAD points to
	stagedFiles: FileChange[]; // in the index, not yet committed
	modifiedFiles: FileChange[]; // changed in the working folder, not staged
	untrackedFiles: string[]; // new files Git does not track yet
};

/** One commit. */
export type Commit = {
	id: string; // the full 40-character commit ID
	message: string; // the first line of the commit message
	parentIds: string[]; // none for the first commit, two for a merge
	authorName: string;
	authoredAt: string; // ISO 8601 date and time
};

/** One branch, local ("main") or remote-tracking ("origin/main"). */
export type Branch = {
	name: string;
	commitId: string;
	isRemote: boolean;
};

/** One tag. */
export type Tag = {
	name: string;
	commitId: string;
};

/**
 * Where HEAD points: at a branch (the usual case) or straight at a commit ("detached").
 * commitId is null on a branch before the first commit.
 */
export type HeadState =
	| { kind: 'branch'; branchName: string; commitId: string | null }
	| { kind: 'detached'; commitId: string };

/** What happened to a file. */
export type ChangeKind = 'added' | 'modified' | 'deleted' | 'renamed';

/** One changed file, staged or not. */
export type FileChange = {
	path: string;
	changeKind: ChangeKind;
	oldPath: string | null; // the old path for renamed files, otherwise null
};
