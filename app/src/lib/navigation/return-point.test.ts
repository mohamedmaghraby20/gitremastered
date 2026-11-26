/**
 * return-point.test.ts
 * Tests for remembering where a link between lessons was followed from, and going back.
 */

import { describe, expect, it } from 'vitest';
import {
	findReturnPoint,
	forgetReturnPoint,
	rememberReturnPoint,
	startGoingBack,
	takePlaceToRestore
} from './return-point.svelte';

const fromPilot = {
	fromLessonId: 'three-areas',
	fromTitle: 'Status, stage, commit',
	layerId: 'underTheHood' as const,
	scrollTop: 640,
	toLessonId: 'ignoring-files'
};

describe('return point', () => {
	it('offers the way back only on the lesson the link opened', () => {
		rememberReturnPoint(fromPilot);
		expect(findReturnPoint('ignoring-files')?.fromTitle).toBe('Status, stage, commit');
		expect(findReturnPoint('three-areas')).toBeNull();
		forgetReturnPoint();
		expect(findReturnPoint('ignoring-files')).toBeNull();
	});

	it('going back restores the layer and scroll position, once', () => {
		rememberReturnPoint(fromPilot);
		expect(startGoingBack()).toBe('three-areas');
		expect(findReturnPoint('ignoring-files')).toBeNull();
		expect(takePlaceToRestore('three-areas')).toEqual({
			lessonId: 'three-areas',
			layerId: 'underTheHood',
			scrollTop: 640
		});
		expect(takePlaceToRestore('three-areas')).toBeNull();
	});
});
