/**
 * commands.ts
 * Typed wrappers for every command the screens can ask the Rust core to run (SPEC.md section 3.3).
 * Screens call these functions, never Tauri's invoke() by a raw name, so a typo or a wrong
 * argument is a type error instead of a runtime surprise.
 */

import { invoke } from '@tauri-apps/api/core';
import type { GitHubChallenge, GitHubConnection, GitHubState } from '$lib/types/github';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';

/**
 * Asks the installed Git for its version.
 * @returns the version number, like "2.55.0.windows.1"
 * @throws the core's message if Git is missing or answers oddly
 */
export function getGitVersion(): Promise<string> {
	return invoke<string>('get_git_version');
}

/**
 * Opens a mission's practice folder as the student left it, or builds it from its setup steps
 * when there is none yet (or the steps changed since it was built).
 * @param missionId - the mission's ID, which names the folder
 * A GitHub challenge also prepares its practice repository on GitHub, only with consent.
 * @param missionId - the mission's ID, which names the folder
 * @param setupSteps - shell commands from challenges.yaml, run in order
 * @param github - the challenge's GitHub field, or null for a local challenge
 * @param githubConsent - true when the student agreed to the GitHub consent screen
 * @returns the practice folder's path
 */
export function openPracticeRepo(
	missionId: string,
	setupSteps: string[],
	github: GitHubChallenge | null = null,
	githubConsent = false
): Promise<string> {
	return invoke<string>('open_practice_repo', { missionId, setupSteps, github, githubConsent });
}

/**
 * Finds a mission's practice folder without creating or changing it.
 * @param missionId - the mission's ID
 * @returns the folder's path, or null if it was never built
 */
export function findPracticeRepo(missionId: string): Promise<string | null> {
	return invoke<string | null>('find_practice_repo', { missionId });
}

/**
 * Deletes a mission's practice folder and builds it again from its setup steps.
 * @param missionId - the mission's ID
 * @param github - the challenge's GitHub field, or null for a local challenge
 * @param githubConsent - true when the student agreed to the GitHub consent screen
 * @returns the practice folder's path
 */
export function resetPracticeRepo(
	missionId: string,
	github: GitHubChallenge | null = null,
	githubConsent = false
): Promise<string> {
	return invoke<string>('reset_practice_repo', { missionId, github, githubConsent });
}

/**
 * Starts a real shell inside a practice folder.
 * @param practiceFolderPath - where the shell starts
 * @returns the new session's ID, used by the other terminal functions
 */
export function startTerminalSession(practiceFolderPath: string): Promise<string> {
	return invoke<string>('start_terminal_session', { practiceFolderPath });
}

/**
 * Sends typed text (keys, pasted text) to a shell session.
 * @param sessionId - the session's ID
 * @param text - the characters to send
 */
export function sendTerminalInput(sessionId: string, text: string): Promise<void> {
	return invoke<void>('send_terminal_input', { sessionId, text });
}

/**
 * Tells a shell session its new size, after its pane is resized.
 * @param sessionId - the session's ID
 * @param columns - characters per line
 * @param rows - lines on screen
 */
export function resizeTerminal(sessionId: string, columns: number, rows: number): Promise<void> {
	return invoke<void>('resize_terminal', { sessionId, columns, rows });
}

/**
 * Stops a shell session and its shell process (when the lesson closes or the terminal restarts).
 * @param sessionId - the session's ID
 */
export function closeTerminalSession(sessionId: string): Promise<void> {
	return invoke<void>('close_terminal_session', { sessionId });
}

/**
 * Reads the current state of a practice repository.
 * @param practiceFolderPath - the practice folder
 * @returns the repository snapshot
 */
export function getRepoSnapshot(practiceFolderPath: string): Promise<RepoSnapshot> {
	return invoke<RepoSnapshot>('get_repo_snapshot', { practiceFolderPath });
}

/**
 * Asks whether the GitHub CLI is installed and signed in, and as whom. Only reads.
 * @returns the connection
 */
export function getGitHubConnection(): Promise<GitHubConnection> {
	return invoke<GitHubConnection>('get_github_connection');
}

/**
 * Reads a practice repository's state on GitHub (time-limited; call it now and then only).
 * @param repoName - the repository's name, like gitremastered-practice-flow
 * @returns its state
 */
export function getGitHubState(repoName: string): Promise<GitHubState> {
	return invoke<GitHubState>('get_github_state', { repoName });
}

/**
 * Lists the practice repositories on the student's account.
 * @returns their names
 */
export function listPracticeRepositories(): Promise<string[]> {
	return invoke<string[]>('list_practice_repositories');
}

/**
 * Deletes every practice repository on the student's account (needs the delete_repo scope).
 * @param hasConsent - true once the student confirmed
 * @returns the names deleted
 */
export function deletePracticeRepositories(hasConsent: boolean): Promise<string[]> {
	return invoke<string[]>('delete_practice_repositories', { hasConsent });
}
