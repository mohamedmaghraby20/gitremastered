/**
 * home-data.test.ts
 * Tests for the home screen's data, built from the real course content and sample progress:
 * a new student and a returning one.
 */

import { describe, expect, it } from 'vitest';
import { emptyProgress, type ProgressData } from '$lib/stores/progress';
import { countCourseLessons } from '$lib/course-map/course-map-data';
import { buildHomeData } from './home-data';

describe('buildHomeData', () => {
	it('gives a new student the first lesson to start and nothing to continue or review', () => {
		const homeData = buildHomeData(emptyProgress, 0);

		expect(homeData.continueCard).toBeNull();
		expect(homeData.firstLessonCard?.id).toBe('what-is-git');
		expect(homeData.upNextCards[0]?.id).toBe('setup');
		expect(homeData.reviewPick).toBeNull();
		expect(homeData.wholeProgress.doneCount).toBe(0);
	});

	it('gives a returning student the last lesson, its furthest layer, and a review question', () => {
		const returning: ProgressData = {
			...emptyProgress,
			finishedLessons: ['three-areas'],
			lastOpenedLessonId: 'ignoring-files',
			furthestLayers: { 'ignoring-files': 'underTheHood' }
		};

		const homeData = buildHomeData(returning, 0);

		expect(homeData.continueCard?.id).toBe('ignoring-files');
		expect(homeData.furthestLayerId).toBe('underTheHood');
		expect(homeData.upNextCards[0]?.id).toBe('remove-move-files');
		expect(homeData.wholeProgress).toEqual({ doneCount: 1, totalCount: countCourseLessons() });
		expect(homeData.reviewPick?.lessonId).toBe('three-areas');
		expect(homeData.reviewPick?.lessonTitle).toBe('Status, stage, commit: the three areas');
	});
});
