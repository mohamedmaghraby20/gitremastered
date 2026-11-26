/**
 * group-commands.test.ts
 * Tests for sorting command pages into the command index's groups.
 */

import { describe, expect, it } from 'vitest';
import type { CommandPage } from '$lib/types/reference';
import { groupCommands } from './group-commands';

/**
 * Makes a command page with the fields the grouping reads.
 * @param command - e.g. "git status"
 * @param group - e.g. "Daily loop"
 * @param lessonIds - the lessons that teach it
 * @returns the page
 */
function commandPage(command: string, group: string, lessonIds: string[]): CommandPage {
	return {
		id: command.replace(' ', '-'),
		command,
		group,
		summary: '',
		usage: [command],
		bookSection: '',
		bookUrl: '',
		lessonIds,
		body: ''
	};
}

describe('groupCommands', () => {
	it('orders groups and commands by the first lesson that teaches them', () => {
		const pages = [
			commandPage('git rm', 'Ignore files', ['ignoring-files']),
			commandPage('git commit', 'Daily loop', ['three-areas']),
			commandPage('git add', 'Daily loop', ['three-areas']),
			commandPage('git restore', 'Undo', ['three-areas'])
		];

		const groups = groupCommands(pages, ['three-areas', 'ignoring-files']);

		expect(groups.map((group) => group.name)).toEqual(['Daily loop', 'Undo', 'Ignore files']);
		expect(groups[0].commands.map((page) => page.command)).toEqual(['git add', 'git commit']);
	});

	it('puts commands no listed lesson teaches at the end', () => {
		const pages = [
			commandPage('git gc', 'Maintenance', []),
			commandPage('git status', 'Daily loop', ['three-areas'])
		];
		expect(groupCommands(pages, ['three-areas']).map((group) => group.name)).toEqual([
			'Daily loop',
			'Maintenance'
		]);
	});
});
