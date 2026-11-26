/**
 * repo-snapshot.ts
 * The state of a practice repository at one moment (SPEC.md section 3.4).
 * Mirrors app/src-tauri/src/models/repo_snapshot.rs; a Rust test checks the JSON names match.
 */

/** The state of the practice repository at one moment. */
export type RepoSnapshot = {
	commits: Commit[]; // every commit Git still remembers, newest first (see Commit.isReachable)
	branches: Branch[]; // local and remote-tracking branches
	tags: Tag[];
	head: HeadState; // which branch or commit HEAD points to
	stagedFiles: FileChange[]; // in the index, not yet committed
	modifiedFiles: FileChange[]; // changed in the working tree, not staged
	untrackedFiles: string[]; // new files Git does not track yet
	committedFiles: string[]; // every file saved in the latest commit (HEAD); empty before the first
	conflictedFiles: string[]; // files with an unresolved merge conflict (also in modifiedFiles)
	operation: Operation | null; // a merge, rebase, revert… waiting to be finished
	stashes: string[]; // the message of each stash entry, newest first
	remotes: Remote[];
	localConfig: ConfigEntry[]; // the repository's own settings (git config --local)
	answer: string | null; // the first line of answer.txt, for "find out and write it down" challenges
	// Version 3 (phase 6):
	workingFileTexts: FileText[]; // small text files in the working tree, as they are on disk
	committedFileTexts: FileText[]; // small text files as they are in the latest commit (HEAD)
	worktrees: Worktree[]; // linked worktrees (git worktree add), not the main one
	submodules: Submodule[]; // submodules listed in .gitmodules
	sparseSkippedFiles: string[]; // committed files a sparse checkout left out of the working tree
};

/** One commit. */
export type Commit = {
	id: string; // the full 40-character commit ID
	message: string; // the first line of the commit message
	parentIds: string[]; // none for the first commit, two for a merge
	authorName: string;
	authoredAt: string; // ISO 8601 date and time
	isReachable: boolean; // false for a commit only the reflog remembers (after amend or reset)
	isSigned: boolean; // true when Git verified a good signature (git log %G? is G or U)
	changedPaths: string[]; // the files this commit added, changed or deleted (none for a merge)
};

/** One branch, local ("main") or remote-tracking ("origin/main"). */
export type Branch = {
	name: string;
	commitId: string;
	isRemote: boolean;
	upstream: string | null; // the remote-tracking branch it follows, like "origin/main"
	ahead: number; // commits this branch has that its upstream does not
	behind: number; // commits the upstream has that this branch does not
};

/** One tag. */
export type Tag = {
	name: string;
	commitId: string;
	isAnnotated: boolean; // true for a tag with its own message, author and date
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

/** A multi-step Git command that started and is waiting for the student to finish it. */
export type Operation = 'merge' | 'rebase' | 'revert' | 'cherry-pick' | 'bisect';

/** One remote: a short name for another copy of the repository. */
export type Remote = {
	name: string; // like "origin"
	url: string; // a URL or a folder path
	tagNames: string[]; // the remote's tags; only known for a remote that is a local folder
};

/** One setting from the repository's own config file. */
export type ConfigEntry = {
	key: string; // lower case, like "user.name"
	value: string;
};

/**
 * One small text file and its contents. Only files up to 8 KB are read, and at most 40 of
 * them, so the snapshot stays small; a file left out is simply missing from the list.
 */
export type FileText = {
	path: string;
	text: string;
};

/** A linked worktree: another folder with its own checked-out branch, sharing this repository. */
export type Worktree = {
	path: string; // the folder, as Git recorded it
	branch: string | null; // the branch checked out there, like "hotfix"; null when detached
};

/** A submodule: another repository kept inside this one at a fixed commit. */
export type Submodule = {
	path: string; // where it lives in the working tree, like "vendor/library"
	isInitialized: boolean; // true once its files are checked out (git submodule update --init)
};
