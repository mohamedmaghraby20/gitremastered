/**
 * mission-runner.ts
 * Runs one mission for real: in a temporary folder, it runs the mission's setup steps and its
 * reference solution with real Git (through bash, like the app), reads the repo snapshot with
 * the app's own Rust reader, and checks every goal with the app's own goal checker.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Mission } from '../../src/lib/types/mission.ts';
import type { RepoSnapshot } from '../../src/lib/types/repo-snapshot.ts';
import { checkGoals } from '../../src/lib/mission-engine/goal-checker.ts';

/** The Rust project, where the snapshot printer lives. */
const rustProjectPath = fileURLToPath(new URL('../../src-tauri', import.meta.url));

/** What happened when a mission ran. */
export type MissionRunResult = {
	goalResults: boolean[]; // one per goal, in order
	missedGoals: string[]; // the labels of the goals that were not met
};

/**
 * Environment for the steps: a fixed identity (CI machines have none) and no prompts.
 * A mission's own `git config` steps still win, because repo settings beat these defaults.
 */
const stepEnvironment = {
	...process.env,
	GIT_TERMINAL_PROMPT: '0',
	GIT_EDITOR: 'true',
	GIT_AUTHOR_NAME: 'Mission Test',
	GIT_AUTHOR_EMAIL: 'mission-test@example.com',
	GIT_COMMITTER_NAME: 'Mission Test',
	GIT_COMMITTER_EMAIL: 'mission-test@example.com'
};

/**
 * Runs a mission's setup and solution, then checks its goals.
 * @param missionId - names the temporary practice folder
 * @param mission - the mission from mission.yaml
 * @returns each goal's result and the labels of missed goals
 */
export function runMission(missionId: string, mission: Mission): MissionRunResult {
	const practiceRoot = mkdtempSync(join(tmpdir(), 'gitremastered-missions-'));
	// The same layout as the app: a workspace per mission, with the practice folder inside,
	// so a remote lesson can build "../origin.git" beside it.
	const practiceFolder = join(practiceRoot, missionId, 'project');
	mkdirSync(practiceFolder, { recursive: true });
	try {
		const bashProgram = findBashProgram();
		for (const step of [...mission.setup, ...mission.solution]) {
			execFileSync(bashProgram, ['-c', step], {
				cwd: practiceFolder,
				env: stepEnvironment,
				stdio: 'pipe'
			});
		}
		const snapshot = readSnapshot(practiceRoot, practiceFolder);
		const goalResults = checkGoals(mission.goals, snapshot);
		const missedGoals = mission.goals
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
function readSnapshot(practiceRoot: string, practiceFolder: string): RepoSnapshot {
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
function findBashProgram(): string {
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
