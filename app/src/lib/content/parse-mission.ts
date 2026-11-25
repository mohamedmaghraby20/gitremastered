/**
 * parse-mission.ts
 * Reads mission.yaml: the brief, setup steps, goal checks, hint ladder and reference solution.
 */

import {
	goalCheckKinds,
	type GoalCheck,
	type Mission,
	type MissionGoal
} from '../types/mission.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads a whole mission.yaml.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the typed mission
 * @throws ContentError naming the file and the problem
 */
export function parseMissionText(fileText: string, fileName: string): Mission {
	const reader = FieldReader.fromYaml(fileText, fileName);
	const goalReaders = reader.recordList('goal', 'goal');
	return {
		brief: reader.text('brief'),
		setup: reader.textList('setup'),
		goals: goalReaders.map(readGoal),
		hints: reader.textList('hints'),
		solution: reader.textList('solution')
	};
}

/**
 * Reads one goal: its check kind, the fields that kind needs, and its checklist label.
 * @param goalReader - a reader for one item of the "goal" list
 * @returns the typed goal
 */
function readGoal(goalReader: FieldReader): MissionGoal {
	const label = goalReader.text('label');
	const goalCheck = readGoalCheck(goalReader);
	return { ...goalCheck, label };
}

/**
 * Reads the check part of a goal. Each kind of check needs different fields.
 * @param goalReader - a reader for one goal
 * @returns the typed goal check
 */
function readGoalCheck(goalReader: FieldReader): GoalCheck {
	const checkKind = goalReader.text('check');
	if (!isGoalCheckKind(checkKind)) {
		goalReader.fail(`unknown check "${checkKind}"`);
	}
	switch (checkKind) {
		case 'file-is-untracked':
		case 'file-is-modified':
		case 'file-is-staged':
		case 'file-is-committed':
			return { check: checkKind, file: goalReader.text('file') };
		case 'commit-count-at-least':
			return { check: checkKind, count: goalReader.wholeNumber('count') };
		case 'working-folder-clean':
			return { check: checkKind };
	}
}

/**
 * Checks that a text is one of the known goal check names.
 * @param checkKind - the "check" value from the file
 * @returns true if the app knows this check
 */
function isGoalCheckKind(checkKind: string): checkKind is GoalCheck['check'] {
	return (goalCheckKinds as readonly string[]).includes(checkKind);
}
