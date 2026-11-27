/**
 * parse-challenges.ts
 * Reads a lesson's challenges.yaml: 3 or more challenges, from easy to hard. Each one has an
 * ID, a title and a level, plus the mission fields (brief, setup, goals, hints, solution).
 * The student picks any challenge; starting one builds the practice project from its setup.
 */

import { challengeLevels, type Challenge, type ChallengeLevel } from '../types/mission.ts';
import { FieldReader } from './field-reader.ts';
import { readMissionFields } from './parse-mission.ts';

/** Every lesson offers at least this many challenges (decided 2026-11-26). */
export const smallestChallengeCount = 3;

/**
 * Reads a whole challenges.yaml.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the challenges, in file order (easy to hard)
 * @throws ContentError naming the file, the challenge and the problem
 */
export function parseChallengesText(fileText: string, fileName: string): Challenge[] {
	const reader = FieldReader.fromYaml(fileText, fileName);
	const challengeReaders = reader.recordList('challenges', 'challenge', {
		minimum: smallestChallengeCount
	});
	const challenges = challengeReaders.map(readChallenge);
	checkChallengeIds(challenges, reader);
	checkLevelOrder(challenges, reader);
	return challenges;
}

/**
 * Reads one challenge.
 * @param challengeReader - a reader for one item of "challenges"
 * @returns the typed challenge
 */
function readChallenge(challengeReader: FieldReader): Challenge {
	const level = challengeReader.text('level');
	if (!isChallengeLevel(level)) {
		challengeReader.fail(`"level" must be one of ${challengeLevels.join(', ')}`);
	}
	return {
		id: challengeReader.text('id'),
		title: challengeReader.text('title'),
		level,
		...readMissionFields(challengeReader)
	};
}

/**
 * Checks that no two challenges share an ID (the ID names the challenge in saved progress).
 * @param challenges - the lesson's challenges
 * @param reader - the file's reader, for the error message
 */
function checkChallengeIds(challenges: Challenge[], reader: FieldReader): void {
	const seenIds = new Set<string>();
	for (const challenge of challenges) {
		if (seenIds.has(challenge.id)) {
			reader.fail(`the challenge id "${challenge.id}" is used twice`);
		}
		seenIds.add(challenge.id);
	}
}

/**
 * Checks that the challenges go from easy to hard, never back down.
 * @param challenges - the lesson's challenges, in file order
 * @param reader - the file's reader, for the error message
 */
function checkLevelOrder(challenges: Challenge[], reader: FieldReader): void {
	for (let index = 1; index < challenges.length; index += 1) {
		const previousRank = challengeLevels.indexOf(challenges[index - 1].level);
		if (challengeLevels.indexOf(challenges[index].level) < previousRank) {
			reader.fail(
				`challenge ${index + 1} is easier than the one before it; list them easy to hard`
			);
		}
	}
}

/**
 * Checks that a text is one of the three levels.
 * @param level - the "level" value from the file
 * @returns true for "easy", "medium" or "hard"
 */
function isChallengeLevel(level: string): level is ChallengeLevel {
	return (challengeLevels as readonly string[]).includes(level);
}
