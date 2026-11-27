/**
 * parse-challenge-details.ts
 * Reads one challenge's details: the brief, setup steps, goal checks, hint ladder and
 * reference solution (parse-challenges.ts reads the rest of each challenge).
 */

import {
	goalCheckFields,
	goalCheckKinds,
	isGitHubGoalCheck,
	type GoalCheck,
	type GoalCheckKind,
	type ChallengeDetails,
	type ChallengeGoal
} from '../types/challenge.ts';
import { FieldReader } from './field-reader.ts';
import { checkGitHubLines, readGitHubChallenge } from './parse-github.ts';

/**
 * Reads the challenge details of one challenge.
 * @param reader - a reader for one challenge (its brief, setup, goal, hints, solution)
 * @returns the typed challenge
 * @throws ContentError naming the file, the challenge and the problem
 */
export function readChallengeDetails(reader: FieldReader): ChallengeDetails {
	const goalReaders = reader.recordList('goal', 'goal');
	const setup = reader.textList('setup');
	const solution = reader.textList('solution');
	checkGitHubLines(reader, setup, solution);
	const goals = goalReaders.map(readGoal);
	const github = readGitHubChallenge(reader.optionalRecord('github'));
	const hasGitHubGoal = goals.some((goal) => isGitHubGoalCheck(goal));
	if (hasGitHubGoal && github === null) {
		// Such a goal could never be met: nothing reads GitHub without a practice repository.
		reader.fail('a github-… goal needs a "github" field with the practice repository');
	}
	return {
		brief: reader.text('brief'),
		setup,
		goals,
		// A checkpoint's challenges have no hints; load-lessons.ts checks that only they do.
		hints: reader.optionalTextList('hints'),
		solution,
		github
	};
}

/**
 * Reads one goal: its check kind, the fields that kind needs, and its checklist label.
 * @param goalReader - a reader for one item of the "goal" list
 * @returns the typed goal
 */
function readGoal(goalReader: FieldReader): ChallengeGoal {
	const label = goalReader.text('label');
	const goalCheck = readGoalCheck(goalReader);
	return { ...goalCheck, label };
}

/** The one goal field that is a whole number; every other field is text. */
const numberFieldName = 'count';

/**
 * Reads the check part of a goal. Each kind of check needs different fields; the table
 * goalCheckFields (types/challenge.ts) lists them.
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
