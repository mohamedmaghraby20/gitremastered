/**
 * switch-keys.test.ts
 * Unit tests for the segmented switch's arrow-key rules.
 */

import { describe, expect, it } from 'vitest';
import { findNextOptionIndex } from './switch-keys';

describe('findNextOptionIndex', () => {
	it('moves to the next option on Right and Down', () => {
		expect(findNextOptionIndex(0, 'ArrowRight', 3)).toBe(1);
		expect(findNextOptionIndex(1, 'ArrowDown', 3)).toBe(2);
	});

	it('moves to the previous option on Left and Up', () => {
		expect(findNextOptionIndex(2, 'ArrowLeft', 3)).toBe(1);
		expect(findNextOptionIndex(1, 'ArrowUp', 3)).toBe(0);
	});

	it('wraps around at both ends', () => {
		expect(findNextOptionIndex(2, 'ArrowRight', 3)).toBe(0);
		expect(findNextOptionIndex(0, 'ArrowLeft', 3)).toBe(2);
	});

	it('jumps to the first and last option on Home and End', () => {
		expect(findNextOptionIndex(1, 'Home', 3)).toBe(0);
		expect(findNextOptionIndex(1, 'End', 3)).toBe(2);
	});

	it('ignores every other key', () => {
		expect(findNextOptionIndex(1, 'Enter', 3)).toBeNull();
		expect(findNextOptionIndex(1, 'Tab', 3)).toBeNull();
	});
});
