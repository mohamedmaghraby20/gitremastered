/**
 * challenge-session.ts
 * The parts of a challenge that are pure state, with no screen code: the hint ladder
 * (hints revealed one at a time, gentle first, the answer last) and the message shown after
 * "Check challenge".
 */

/** The hint ladder: how many hints are showing, out of how many. */
export type HintLadder = { revealedCount: number; totalCount: number };

/**
 * Starts a ladder with no hint showing.
 * @param totalCount - how many hints the challenge has
 * @returns the ladder
 */
export function createHintLadder(totalCount: number): HintLadder {
	return { revealedCount: 0, totalCount };
}

/**
 * Shows one more hint, unless all are already showing.
 * @param ladder - the ladder now
 * @returns the ladder with one more hint revealed
 */
export function revealNextHint(ladder: HintLadder): HintLadder {
	const revealedCount = Math.min(ladder.revealedCount + 1, ladder.totalCount);
	return { ...ladder, revealedCount };
}

/**
 * Tells whether another hint can be shown.
 * @param ladder - the ladder
 * @returns true while some hints are still hidden
 */
export function hasHiddenHints(ladder: HintLadder): boolean {
	return ladder.revealedCount < ladder.totalCount;
}

/**
 * Writes the label of the hint button, like "Show a hint (1 of 3)".
 * @param ladder - the ladder
 * @returns the label, or "No more hints" once all are showing
 */
export function hintButtonLabel(ladder: HintLadder): string {
	if (!hasHiddenHints(ladder)) {
		return 'No more hints';
	}
	return `Show a hint (${ladder.revealedCount + 1} of ${ladder.totalCount})`;
}

/**
 * Writes the answer to "Check challenge".
 * @param goalResults - one true/false per goal
 * @returns a short, encouraging sentence
 */
export function describeCheckResult(goalResults: boolean[]): string {
	const metCount = goalResults.filter((isMet) => isMet).length;
	if (metCount === goalResults.length) {
		return 'Challenge complete. Every goal is met.';
	}
	const leftCount = goalResults.length - metCount;
	const goalWord = leftCount === 1 ? 'goal' : 'goals';
	return `Not yet: ${leftCount} ${goalWord} to go. The unticked ${goalWord} show what is left.`;
}
