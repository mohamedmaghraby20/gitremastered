/**
 * history-goals.ts
 * Goal checks about the history HEAD is on (how many commits, their messages, a merge),
 * about work in progress (an unfinished merge, the stash), about the repository's settings,
 * and about answers the student writes into answer.txt. Pure functions on a snapshot.
 */

import type { HistoryGoalCheck } from '$lib/types/mission';
import type { RepoSnapshot } from '$lib/types/repo-snapshot';
import { findHeadCommit, findHistory, messageContains } from './commit-walk';

/** A commit ID in an answer must be at least this long, like Git's own short IDs. */
const shortestCommitIdAnswer = 4;

/**
 * Checks one history goal.
 * @param goalCheck - a goal like { check: "commit-count-is", count: 2 }
 * @param snapshot - the repo state right now
 * @returns true if the goal is met
 */
export function isHistoryGoalMet(goalCheck: HistoryGoalCheck, snapshot: RepoSnapshot): boolean {
	const headHistory = findHistory(snapshot, snapshot.head.commitId);
	switch (goalCheck.check) {
		case 'commit-count-at-least':
			return headHistory.length >= goalCheck.count;
		case 'commit-count-is':
			return headHistory.length === goalCheck.count;
		case 'latest-commit-message-contains': {
			const headCommit = findHeadCommit(snapshot);
			return headCommit !== null && messageContains(headCommit, goalCheck.text);
		}
		case 'commit-exists':
			return headHistory.some((commit) => messageContains(commit, goalCheck.message));
		case 'commit-is-gone':
			return !headHistory.some((commit) => messageContains(commit, goalCheck.message));
		case 'head-commit-is-merge':
			return (findHeadCommit(snapshot)?.parentIds.length ?? 0) >= 2;
		case 'no-operation-in-progress':
			return snapshot.operation === null && snapshot.conflictedFiles.length === 0;
		case 'stash-count-is':
			return snapshot.stashes.length === goalCheck.count;
		case 'config-is':
			return isConfigSet(snapshot, goalCheck.key, goalCheck.value);
		case 'answer-is':
			return isSameText(snapshot.answer, goalCheck.answer);
		case 'answer-is-commit':
			return doesAnswerNameCommit(snapshot, goalCheck.message);
	}
}

/**
 * Tells whether the repository's own settings hold a key with a value. Git stores keys in
 * lower case, so the key is compared that way; the value must match exactly.
 * @param snapshot - the repo state
 * @param key - the setting, like "user.name"
 * @param value - the wanted value
 * @returns true if the setting has that value
 */
function isConfigSet(snapshot: RepoSnapshot, key: string, value: string): boolean {
	return snapshot.localConfig.some(
		(entry) => entry.key.toLowerCase() === key.toLowerCase() && entry.value === value
	);
}

/**
 * Compares an answer with the expected one, ignoring upper and lower case and outer spaces.
 * @param answer - what the student wrote (null without an answer file)
 * @param expected - the right answer
 * @returns true if they match
 */
function isSameText(answer: string | null, expected: string): boolean {
	return answer !== null && answer.trim().toLowerCase() === expected.trim().toLowerCase();
}

/**
 * Tells whether the answer is the ID (short or full) of the commit with a given message.
 * @param snapshot - the repo state
 * @param message - the commit's message
 * @returns true if the answer names that commit
 */
function doesAnswerNameCommit(snapshot: RepoSnapshot, message: string): boolean {
	const answer = snapshot.answer?.trim().toLowerCase() ?? '';
	if (answer.length < shortestCommitIdAnswer) {
		return false;
	}
	return snapshot.commits.some(
		(commit) => isSameText(commit.message, message) && commit.id.startsWith(answer)
	);
}
