/**
 * commands.test.ts
 * Tests for the typed command wrappers, with Tauri's invoke() replaced by a mock:
 * each wrapper must call the right Rust command with the right argument names.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import {
	closeTerminalSession,
	openPracticeRepo,
	getGitVersion,
	resizeTerminal,
	sendTerminalInput
} from './commands';

// Replace the real bridge: tests run outside the app window, where there is no Rust core.
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }));

const mockedInvoke = vi.mocked(invoke);

beforeEach(() => {
	mockedInvoke.mockReset();
});

describe('getGitVersion', () => {
	it('calls get_git_version and returns its answer', async () => {
		mockedInvoke.mockResolvedValue('2.55.0.windows.1');

		const version = await getGitVersion();

		expect(mockedInvoke).toHaveBeenCalledWith('get_git_version');
		expect(version).toBe('2.55.0.windows.1');
	});

	it("passes on the core's error when Git is missing", async () => {
		mockedInvoke.mockRejectedValue('Could not run Git. Is it installed?');

		await expect(getGitVersion()).rejects.toBe('Could not run Git. Is it installed?');
	});
});

describe('contract commands', () => {
	it('send camelCase argument names, which Tauri maps to Rust snake_case', async () => {
		mockedInvoke.mockResolvedValue(undefined);

		await openPracticeRepo('three-areas', ['git init']);
		await sendTerminalInput('session-1', 'git status\r');
		await resizeTerminal('session-1', 80, 24);
		await closeTerminalSession('session-1');

		expect(mockedInvoke).toHaveBeenCalledWith('open_practice_repo', {
			missionId: 'three-areas',
			setupSteps: ['git init'],
			github: null
		});
		expect(mockedInvoke).toHaveBeenCalledWith('send_terminal_input', {
			sessionId: 'session-1',
			text: 'git status\r'
		});
		expect(mockedInvoke).toHaveBeenCalledWith('resize_terminal', {
			sessionId: 'session-1',
			columns: 80,
			rows: 24
		});
		expect(mockedInvoke).toHaveBeenCalledWith('close_terminal_session', { sessionId: 'session-1' });
	});
});
