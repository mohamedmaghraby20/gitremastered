/**
 * home-data.test.ts
 * Tests for the home screen's data, built from the real course content and sample progress:
 * a new student and a returning one.
 */

import { describe, expect, it } from 'vitest';
import { emptyProgress, type ProgressData } from '$lib/stores/progress';
import { buildHomeData } from './home-data';

describe('buildHomeData', () => {
	it('gives a new student the first lesson to start and nothing to continue or review', () => {
		const homeData = buildHomeData(emptyProgress, 0);

		expect(homeData.continueCard).toBeNull();
		expect(homeData.firstLessonCard?.id).toBe('three-areas');
		expect(homeData.upNextCards.map((card) => card.id)).toEqual(['ignoring-files']);
		expect(homeData.reviewPick).toBeNull();
		expect(homeData.wholeProgress.doneCount).toBe(0);
	});

	it('gives a returning student the last lesson, its furthest layer, and a review question', () => {
		const returning: ProgressData = {
			...emptyProgress,
			finishedMissions: ['three-areas'],
			lastOpenedLessonId: 'ignoring-files',
			furthestLayers: { 'ignoring-files': 'underTheHood' }
		};

		const homeData = buildHomeData(returning, 0);

		expect(homeData.continueCard?.id).toBe('ignoring-files');
		expect(homeData.furthestLayerId).toBe('underTheHood');
		expect(homeData.upNextCards).toEqual([]);
		expect(homeData.wholeProgress).toEqual({ doneCount: 1, totalCount: 2 });
		expect(homeData.reviewPick?.lessonId).toBe('three-areas');
		expect(homeData.reviewPick?.lessonTitle).toBe('Status, stage, commit: the three areas');
	});
});
