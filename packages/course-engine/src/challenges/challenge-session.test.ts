/**
 * challenge-session.test.ts
 * Tests for the hint ladder and the "Check challenge" message.
 */

import { describe, expect, it } from 'vitest';
import {
	createHintLadder,
	describeCheckResult,
	hasHiddenHints,
	hintButtonLabel,
	revealNextHint
} from './challenge-session.ts';

describe('hint ladder', () => {
	it('starts with no hint showing', () => {
		const ladder = createHintLadder(3);
		expect(ladder.revealedCount).toBe(0);
		expect(hintButtonLabel(ladder)).toBe('Show a hint (1 of 3)');
	});

	it('reveals hints one at a time and stops at the last', () => {
		let ladder = createHintLadder(3);
		ladder = revealNextHint(ladder);
		expect(hintButtonLabel(ladder)).toBe('Show a hint (2 of 3)');
		ladder = revealNextHint(revealNextHint(revealNextHint(ladder)));
		expect(ladder.revealedCount).toBe(3);
		expect(hasHiddenHints(ladder)).toBe(false);
		expect(hintButtonLabel(ladder)).toBe('No more hints');
	});
});

describe('describeCheckResult', () => {
	it('celebrates when every goal is met', () => {
		expect(describeCheckResult([true, true])).toBe('Challenge complete. Every goal is met.');
	});

	it('says how many goals are left', () => {
		expect(describeCheckResult([true, false])).toMatch(/1 goal to go/);
		expect(describeCheckResult([false, false, true])).toMatch(/2 goals to go/);
	});
});
