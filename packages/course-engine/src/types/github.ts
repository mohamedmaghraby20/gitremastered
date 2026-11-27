/**
 * github.ts
 * What the app knows about GitHub (phase 6, wave B): the student's connection through their
 * own `gh` login, a GitHub challenge's practice repository and teammate steps, and the
 * state of that repository for the goal checks.
 * Mirrors apps/desktop/src-tauri/src/models/github.rs and github/teammate.rs.
 */

/** Whether the app can reach GitHub through the student's `gh` login. */
export type GitHubConnection = {
	isGhInstalled: boolean;
	isSignedIn: boolean;
	login: string | null; // like "octocat"
	canDeleteRepos: boolean; // true with the delete_repo scope
};

/** One thing "a teammate" does on GitHub when a challenge starts (decision 3). */
export type TeammateStep =
	| { action: 'open-pull-request'; head: string; base: string; title: string; body: string }
	| { action: 'comment-pull-request'; head: string; body: string }
	| { action: 'merge-pull-request'; head: string; method: 'merge' | 'squash' | 'rebase' }
	| { action: 'create-issue'; title: string; body: string; labels: string[] };

/** A challenge's `github` field: its practice repository and the teammate's steps. */
export type GitHubChallenge = {
	repo: string; // always starts with "gitremastered-practice"
	upstream: string | null; // fork lessons: the shared project; teammate steps and goals use it
	teammate: TeammateStep[];
};

/**
 * The repository the teammate acts on and the GitHub goals read: the upstream when the
 * challenge has one (fork lessons, assumption A4), otherwise its own repository.
 * @param github - a challenge's GitHub field
 * @returns the repository's name
 */
export function sharedRepoName(github: GitHubChallenge): string {
	return github.upstream ?? github.repo;
}

/** One pull request on GitHub. */
export type PullRequest = {
	number: number;
	title: string;
	state: 'open' | 'closed' | 'merged';
	headBranch: string;
	baseBranch: string;
	createdAt: string; // ISO 8601
	commentCount: number;
	reviewCount: number;
};

/** One issue on GitHub (pull requests are not included). */
export type Issue = {
	number: number;
	title: string;
	state: 'open' | 'closed';
	createdAt: string;
	labels: string[];
};

/** One release on GitHub. */
export type Release = {
	tagName: string;
	name: string;
	isDraft: boolean;
	isPrerelease: boolean;
};

/** One run of a GitHub Actions workflow. */
export type WorkflowRun = {
	name: string;
	headBranch: string;
	status: string; // "queued", "in_progress" or "completed"
	conclusion: string | null; // "success", "failure"… once completed
	createdAt: string;
};

/** A practice repository's state on GitHub. */
export type GitHubState = {
	repo: string; // "owner/name"
	defaultBranch: string;
	branches: string[];
	pullRequests: PullRequest[];
	issues: Issue[];
	releases: Release[];
	defaultBranchRules: string[]; // rule types like "pull_request"
	workflowRuns: WorkflowRun[];
};

/**
 * What the GitHub goal checks read: the state, and when the challenge started. Pull
 * requests, issues and workflow runs from an earlier attempt do not count (assumption A6).
 */
export type GitHubContext = {
	state: GitHubState;
	startedAt: string; // ISO 8601
};

/** Every practice repository's name starts with this (decision 4). */
export const practiceRepoPrefix = 'gitremastered-practice';
