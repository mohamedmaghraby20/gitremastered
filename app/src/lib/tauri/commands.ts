/**
 * commands.ts
 * Typed wrappers for every command the screens can ask the Rust core to run (SPEC.md section 3.3).
 * Screens call these functions, never Tauri's invoke() by a raw name, so a typo or a wrong
 * argument is a type error instead of a runtime surprise.
 *
 * Only getGitVersion has its Rust side so far; the others arrive in tasks 12–15 and fail
 * with "command not found" until then.
 */

import { invoke } from '@tauri-apps/api/core';
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
 * Creates a fresh practice folder for a mission and runs its setup steps inside it.
 * @param missionId - the mission's ID, which names the folder
 * @param setupSteps - shell commands from mission.yaml, run in order
 * @returns the practice folder's path
 */
export function createPracticeRepo(missionId: string, setupSteps: string[]): Promise<string> {
	return invoke<string>('create_practice_repo', { missionId, setupSteps });
}

/**
 * Deletes a mission's practice folder and builds it again from its setup steps.
 * @param missionId - the mission's ID
 * @returns the practice folder's path
 */
export function resetPracticeRepo(missionId: string): Promise<string> {
	return invoke<string>('reset_practice_repo', { missionId });
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
 * Reads the current state of a practice repository.
 * @param practiceFolderPath - the practice folder
 * @returns the repository snapshot
 */
export function getRepoSnapshot(practiceFolderPath: string): Promise<RepoSnapshot> {
	return invoke<RepoSnapshot>('get_repo_snapshot', { practiceFolderPath });
}
