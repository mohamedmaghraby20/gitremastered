/**
 * challenge-runner.ts
 * Runs one challenge for real: in a temporary folder, it runs the challenge's setup steps and its
 * reference solution with real Git (through bash, like the app), reads the repo snapshot with
 * the app's own Rust reader, and checks every goal with the app's own goal checker.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ChallengeDetails } from '@gitremastered/course-engine/types/challenge';
import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
import { checkGoals } from '@gitremastered/course-engine/challenges/goal-checker';

/** The Rust project, where the snapshot printer lives. */
const rustProjectPath = fileURLToPath(new URL('../../src-tauri', import.meta.url));

/** What happened when a challenge ran. */
export type ChallengeRunResult = {
	goalResults: boolean[]; // one per goal, in order
	missedGoals: string[]; // the labels of the goals that were not met
};

/**
 * Environment for the steps: a fixed identity (CI machines have none) and no prompts.
 * A challenge's own `git config` steps still win, because repo settings beat these defaults.
 */
export const stepEnvironment = {
	...process.env,
	GIT_TERMINAL_PROMPT: '0',
	GIT_EDITOR: 'true',
	GIT_AUTHOR_NAME: 'Challenge Test',
	GIT_AUTHOR_EMAIL: 'challenge-test@example.com',
	GIT_COMMITTER_NAME: 'Challenge Test',
	GIT_COMMITTER_EMAIL: 'challenge-test@example.com'
};

/**
 * Runs a challenge's setup and solution, then checks its goals.
 * @param practiceId - names the temporary practice folder
 * @param challenge - the challenge from challenges.yaml
 * @returns each goal's result and the labels of missed goals
 */
export function runChallenge(practiceId: string, challenge: ChallengeDetails): ChallengeRunResult {
	const practiceRoot = mkdtempSync(join(tmpdir(), 'gitremastered-challenges-'));
	// The same layout as the app: a workspace per challenge, with the practice folder inside,
	// so a remote lesson can build "../origin.git" beside it.
	const practiceFolder = join(practiceRoot, practiceId, 'project');
	mkdirSync(practiceFolder, { recursive: true });
	try {
		const bashProgram = findBashProgram();
		for (const step of [...challenge.setup, ...challenge.solution]) {
			execFileSync(bashProgram, ['-c', step], {
				cwd: practiceFolder,
				env: stepEnvironment,
				stdio: 'pipe'
			});
		}
		const snapshot = readSnapshot(practiceRoot, practiceFolder);
		const goalResults = checkGoals(challenge.goals, snapshot);
		const missedGoals = challenge.goals
			.filter((_goal, index) => !goalResults[index])
			.map((goal) => goal.label);
		return { goalResults, missedGoals };
	} finally {
		rmSync(practiceRoot, { recursive: true, force: true });
	}
}

/**
 * Builds the snapshot printer once (so later runs only start it).
 * Inputs: none. Output: none; throws if the Rust code does not compile.
 */
export function buildSnapshotPrinter(): void {
	execFileSync('cargo', ['build', '--quiet', '--example', 'print_snapshot'], {
		cwd: rustProjectPath,
		stdio: 'pipe'
	});
}

/**
 * Reads a repo's snapshot with the app's own Rust reader.
 * @param practiceRoot - the temporary practice root
 * @param practiceFolder - the repo folder inside it
 * @returns the snapshot
 */
export function readSnapshot(practiceRoot: string, practiceFolder: string): RepoSnapshot {
	const snapshotJson = execFileSync(
		'cargo',
		['run', '--quiet', '--example', 'print_snapshot', '--', practiceRoot, practiceFolder],
		{ cwd: rustProjectPath, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
	);
	return JSON.parse(snapshotJson) as RepoSnapshot;
}

/**
 * Finds bash: Git Bash next to Git on Windows (like the app), "bash" elsewhere.
 * @returns the program to run
 */
export function findBashProgram(): string {
	if (process.platform !== 'win32') {
		return 'bash';
	}
	const gitExecPath = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim();
	let folder = gitExecPath;
	while (dirname(folder) !== folder) {
		const candidate = join(folder, 'bin', 'bash.exe');
		if (existsSync(candidate)) {
			return candidate;
		}
		folder = dirname(folder);
	}
	throw new Error(`Git Bash was not found near ${gitExecPath}`);
}
