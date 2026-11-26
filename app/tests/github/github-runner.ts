/**
 * github-runner.ts
 * Runs one GitHub challenge for real (task 88), on the account signed in to `gh` on this
 * computer. It uses the app's own guarded Rust code (the `github_practice` example) to
 * prepare the practice repository and play the teammate, runs the setup and the reference
 * solution with real Git, then reads GitHub until every goal is met or time runs out.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GitHubChallenge, GitHubContext, GitHubState } from '../../src/lib/types/github.ts';
import type { Mission } from '../../src/lib/types/mission.ts';
import { checkGoals } from '../../src/lib/mission-engine/goal-checker.ts';
import {
	findBashProgram,
	readSnapshot,
	stepEnvironment,
	type MissionRunResult
} from '../missions/mission-runner.ts';

/** The Rust project, where the GitHub example program lives. */
const rustProjectPath = fileURLToPath(new URL('../../src-tauri', import.meta.url));

/** How long to wait for GitHub to show the goals (an Actions run can take a minute). */
const longestWait = 180_000;

/** How long to wait between two reads of GitHub. */
const readGap = 5_000;

/**
 * Builds the GitHub example program once.
 * Inputs: none. Output: none; throws if it does not compile.
 */
export function buildGitHubProgram(): void {
	execFileSync('cargo', ['build', '--quiet', '--example', 'github_practice'], {
		cwd: rustProjectPath,
		stdio: 'pipe'
	});
}

/**
 * Tells whether `gh` is signed in on this computer.
 * @returns true when GitHub challenges can run
 */
export function isGitHubReady(): boolean {
	try {
		execFileSync('gh', ['auth', 'status'], { stdio: 'pipe' });
		return true;
	} catch {
		return false;
	}
}

/**
 * Runs a GitHub challenge's setup and solution, then checks its goals against the local
 * snapshot and GitHub's state.
 * @param missionId - names the temporary practice folder
 * @param mission - the challenge (its `github` field must be set)
 * @returns each goal's result and the labels of missed goals
 */
export async function runGitHubMission(
	missionId: string,
	mission: Mission
): Promise<MissionRunResult> {
	const github = mission.github as GitHubChallenge;
	const practiceRoot = mkdtempSync(join(tmpdir(), 'gitremastered-github-'));
	const practiceFolder = join(practiceRoot, missionId, 'project');
	mkdirSync(practiceFolder, { recursive: true });
	try {
		const startedAt = new Date(Date.now() - 60_000).toISOString();
		const environment = { ...stepEnvironment, ...callGitHubProgram('prepare', github) };
		runSteps(mission.setup, practiceFolder, environment);
		callGitHubProgram('finish', github);
		runSteps(mission.solution, practiceFolder, environment);
		return await waitForGoals(mission, practiceRoot, practiceFolder, startedAt);
	} finally {
		rmSync(practiceRoot, { recursive: true, force: true });
	}
}

/**
 * Runs shell steps one by one in the practice folder.
 * @param steps - the steps
 * @param practiceFolder - where they run
 * @param environment - the variables they see
 */
function runSteps(steps: string[], practiceFolder: string, environment: NodeJS.ProcessEnv): void {
	const bashProgram = findBashProgram();
	for (const step of steps) {
		execFileSync(bashProgram, ['-c', step], {
			cwd: practiceFolder,
			env: { ...environment, GCM_INTERACTIVE: 'never' },
			stdio: 'pipe'
		});
	}
}

/**
 * Reads the snapshot and GitHub until every goal is met or the wait is over.
 * @param mission - the challenge
 * @param practiceRoot - the temporary practice root
 * @param practiceFolder - the project folder
 * @param startedAt - when the challenge started (ISO 8601)
 * @returns the last results
 */
async function waitForGoals(
	mission: Mission,
	practiceRoot: string,
	practiceFolder: string,
	startedAt: string
): Promise<MissionRunResult> {
	const github = mission.github as GitHubChallenge;
	const deadline = Date.now() + longestWait;
	let goalResults: boolean[] = [];
	while (true) {
		const snapshot = readSnapshot(practiceRoot, practiceFolder);
		const state = callGitHubProgram('state', github) as unknown as GitHubState;
		const context: GitHubContext = { state, startedAt };
		goalResults = checkGoals(mission.goals, snapshot, context);
		if (goalResults.every((isMet) => isMet) || Date.now() > deadline) {
			break;
		}
		await new Promise((resolve) => setTimeout(resolve, readGap));
	}
	const missedGoals = mission.goals
		.filter((_goal, index) => !goalResults[index])
		.map((goal) => goal.label);
	return { goalResults, missedGoals };
}

/**
 * Runs the GitHub example program with the challenge's GitHub field as its request.
 * @param action - "prepare", "finish" or "state"
 * @param github - the challenge's GitHub field
 * @returns the program's JSON answer
 */
function callGitHubProgram(action: string, github: GitHubChallenge): Record<string, string> {
	const answer = execFileSync(
		'cargo',
		['run', '--quiet', '--example', 'github_practice', '--', action],
		{ cwd: rustProjectPath, input: JSON.stringify(github), encoding: 'utf8' }
	);
	return JSON.parse(answer) as Record<string, string>;
}
