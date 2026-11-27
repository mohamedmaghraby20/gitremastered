/**
 * group-commands.ts
 * Sorts the command pages into the command index's groups ("Daily loop", "Undo"…), in the
 * order a student meets them: a group comes as early as the first lesson that teaches one of
 * its commands. Inside a group, commands keep the order of their lessons, then A to Z.
 */

import type { CommandPage } from '@gitremastered/course-engine/types/reference';

/** One group of the command list. */
export type CommandGroup = { name: string; commands: CommandPage[] };

/**
 * Groups command pages for the list.
 * @param commandPages - every command page
 * @param lessonOrder - lesson IDs in course order (the pro path)
 * @returns the groups, earliest first
 */
export function groupCommands(commandPages: CommandPage[], lessonOrder: string[]): CommandGroup[] {
	const sortedPages = [...commandPages].sort(
		(first, second) =>
			findFirstLessonIndex(first, lessonOrder) - findFirstLessonIndex(second, lessonOrder) ||
			first.command.localeCompare(second.command)
	);
	const groupsByName = new Map<string, CommandGroup>();
	for (const commandPage of sortedPages) {
		const group = groupsByName.get(commandPage.group) ?? { name: commandPage.group, commands: [] };
		group.commands.push(commandPage);
		groupsByName.set(commandPage.group, group);
	}
	return [...groupsByName.values()];
}

/**
 * Finds how early in the course a command is first taught.
 * @param commandPage - the command
 * @param lessonOrder - lesson IDs in course order
 * @returns the position of its earliest lesson, or a large number when no listed lesson teaches it
 */
function findFirstLessonIndex(commandPage: CommandPage, lessonOrder: string[]): number {
	const positions = commandPage.lessonIds
		.map((lessonId) => lessonOrder.indexOf(lessonId))
		.filter((position) => position >= 0);
	return positions.length === 0 ? Number.MAX_SAFE_INTEGER : Math.min(...positions);
}
