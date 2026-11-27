/**
 * panel-sizes.test.ts
 * Tests for the resize handles' math.
 */

import { describe, expect, it } from 'vitest';
import { clampShare, shareFromKey, shareFromPointer } from './panel-sizes';

const limits = { smallest: 25, largest: 70 };

describe('shareFromPointer', () => {
	it('turns the pointer position into the first panel share', () => {
		expect(shareFromPointer(500, 100, 1000, limits)).toBe(40);
	});

	it('never lets a panel vanish: the share stays inside the limits', () => {
		expect(shareFromPointer(110, 100, 1000, limits)).toBe(25);
		expect(shareFromPointer(1090, 100, 1000, limits)).toBe(70);
	});

	it('is safe when the space has no size yet', () => {
		expect(shareFromPointer(500, 0, 0, limits)).toBe(25);
	});
});

describe('shareFromKey', () => {
	it('moves two percent per arrow press', () => {
		expect(shareFromKey(40, 'ArrowRight', limits)).toBe(42);
		expect(shareFromKey(40, 'ArrowUp', limits)).toBe(38);
	});

	it('jumps to the limits with Home and End, and stops at them', () => {
		expect(shareFromKey(40, 'Home', limits)).toBe(25);
		expect(shareFromKey(40, 'End', limits)).toBe(70);
		expect(shareFromKey(70, 'ArrowRight', limits)).toBe(70);
	});

	it('ignores other keys', () => {
		expect(shareFromKey(40, 'Enter', limits)).toBeNull();
	});
});

describe('clampShare', () => {
	it('keeps a share inside its limits', () => {
		expect(clampShare(10, limits)).toBe(25);
		expect(clampShare(50, limits)).toBe(50);
	});
});
