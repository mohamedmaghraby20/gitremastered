/**
 * layer-marks.test.ts
 * Tests for the read / next / later marks of a lesson's three reading layers.
 */

import { describe, expect, it } from 'vitest';
import { findLayerMarks } from './layer-marks';

describe('findLayerMarks', () => {
	it('marks Must know as next when nothing was read', () => {
		expect(findLayerMarks(undefined).map((mark) => mark.state)).toEqual(['next', 'later', 'later']);
	});

	it('marks the layers up to the furthest as read and the one after it as next', () => {
		expect(findLayerMarks('mustKnow')).toEqual([
			{ number: 1, label: 'Must know', state: 'read' },
			{ number: 2, label: 'Under the hood', state: 'next' },
			{ number: 3, label: 'Advanced', state: 'later' }
		]);
	});

	it('marks every layer as read after Advanced', () => {
		expect(findLayerMarks('advanced').map((mark) => mark.state)).toEqual(['read', 'read', 'read']);
	});
});
