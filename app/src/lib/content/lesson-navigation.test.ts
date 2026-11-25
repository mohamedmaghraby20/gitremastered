/**
 * lesson-navigation.test.ts
 * Tests for finding a lesson's number, module and neighbours in a learning path.
 */

import { describe, expect, it } from 'vitest';
import type { LearningPath } from '../types/learning-path.ts';
import { findLessonPlace, formatLessonNumber } from './lesson-navigation.ts';

const lessonTitles = new Map([
	['start-a-repo', 'Start a repo'],
	['three-areas', 'Status, stage, commit'],
	['ignoring-files', 'Ignore files']
]);

const samplePath: LearningPath = {
	id: 'pro-path',
	title: 'Pro path',
	modules: [
		{ id: 'orientation', title: 'Orientation', lessonIds: ['start-a-repo'] },
		{ id: 'daily-loop', title: 'Your daily loop', lessonIds: ['three-areas', 'ignoring-files'] }
	]
};

describe('findLessonPlace', () => {
	it('numbers lessons across modules and names the module', () => {
		const place = findLessonPlace(samplePath, lessonTitles, 'three-areas');
		expect(place?.lessonNumber).toBe(2);
		expect(place?.moduleTitle).toBe('Your daily loop');
	});

	it('links to the previous and next lessons, even across modules', () => {
		const place = findLessonPlace(samplePath, lessonTitles, 'three-areas');
		expect(place?.previousLesson).toEqual({
			id: 'start-a-repo',
			title: 'Start a repo',
			lessonNumber: 1
		});
		expect(place?.nextLesson).toEqual({
			id: 'ignoring-files',
			title: 'Ignore files',
			lessonNumber: 3
		});
	});

	it('has no previous link on the first lesson and no next link on the last', () => {
		expect(findLessonPlace(samplePath, lessonTitles, 'start-a-repo')?.previousLesson).toBeNull();
		expect(findLessonPlace(samplePath, lessonTitles, 'ignoring-files')?.nextLesson).toBeNull();
	});

	it('returns nothing for a lesson that is not in the path', () => {
		expect(findLessonPlace(samplePath, lessonTitles, 'no-such-lesson')).toBeUndefined();
	});
});

describe('formatLessonNumber', () => {
	it('pads to two digits, like the course map', () => {
		expect(formatLessonNumber(5)).toBe('05');
		expect(formatLessonNumber(42)).toBe('42');
	});
});
