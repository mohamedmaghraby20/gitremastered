/**
 * parse-mission.ts
 * Reads the mission part of a challenge: the brief, setup steps, goal checks, hint ladder and
 * reference solution (parse-challenges.ts reads the rest of each challenge).
 */

import {
	goalCheckFields,
	goalCheckKinds,
	type GoalCheck,
	type GoalCheckKind,
	type Mission,
	type MissionGoal
} from '../types/mission.ts';
import { FieldReader } from './field-reader.ts';

/**
 * Reads the mission fields of one challenge.
 * @param reader - a reader for one challenge (its brief, setup, goal, hints, solution)
 * @returns the typed mission
 * @throws ContentError naming the file, the challenge and the problem
 */
export function readMissionFields(reader: FieldReader): Mission {
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

/** The one goal field that is a whole number; every other field is text. */
const numberFieldName = 'count';

/**
 * Reads the check part of a goal. Each kind of check needs different fields; the table
 * goalCheckFields (types/mission.ts) lists them.
 * @param goalReader - a reader for one goal
 * @returns the typed goal check
 */
function readGoalCheck(goalReader: FieldReader): GoalCheck {
	const checkKind = goalReader.text('check');
	if (!isGoalCheckKind(checkKind)) {
		goalReader.fail(`unknown check "${checkKind}"`);
	}
	const fields: Record<string, string | number> = {};
	for (const fieldName of goalCheckFields[checkKind]) {
		fields[fieldName] =
			fieldName === numberFieldName
				? goalReader.wholeNumber(fieldName)
				: goalReader.text(fieldName);
	}
	// The table guarantees the fields fit the check kind, which TypeScript cannot see here.
	return { check: checkKind, ...fields } as GoalCheck;
}

/**
 * Checks that a text is one of the known goal check names.
 * @param checkKind - the "check" value from the file
 * @returns true if the app knows this check
 */
function isGoalCheckKind(checkKind: string): checkKind is GoalCheckKind {
	return (goalCheckKinds as readonly string[]).includes(checkKind);
}
