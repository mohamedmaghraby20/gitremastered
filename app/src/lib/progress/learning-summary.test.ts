/**
 * learning-summary.test.ts
 * Tests for "continue learning", "up next", path progress and the furthest layer, over sample
 * progress and sample paths.
 */

import { describe, expect, it } from 'vitest';
import type { BookPath } from '$lib/types/book-path';
import type { LearningPath } from '$lib/types/learning-path';
import {
	countPathProgress,
	findContinueLessonId,
	findUpNextLessonIds,
	isFurtherLayer,
	listBookPathLessonIds,
	listCoreLessonIds,
	listPathLessonIds,
	type StudentPlace
} from './learning-summary';

const proPath: LearningPath = {
	id: 'pro-path',
	title: 'Pro path',
	modules: [
		{ id: 'start', title: 'Start', lessonIds: ['what-is-git', 'setup'] },
		{ id: 'daily-loop', title: 'Your daily loop', lessonIds: ['three-areas', 'ignoring-files'] }
	]
};

const bookPath: BookPath = {
	id: 'book-path',
	title: 'Book path',
	chapters: [
		{
			number: 1,
			title: 'Getting Started',
			sections: [{ number: '1.3', title: 'What is Git?', lessonIds: ['what-is-git'] }]
		},
		{
			number: 2,
			title: 'Git Basics',
			sections: [
				{ number: '2.2', title: 'Recording Changes', lessonIds: ['three-areas', 'ignoring-files'] },
				{ number: '2.4', title: 'Undoing Things', lessonIds: ['three-areas'] }
			]
		}
	]
};

/**
 * Builds a student's place from a few fields.
 * @param changes - the fields that differ from a new student
 * @returns the place
 */
function place(changes: Partial<StudentPlace>): StudentPlace {
	return { finishedMissions: [], lastOpenedLessonId: null, ...changes };
}

describe('listing lessons', () => {
	it('lists the pro path in module order', () => {
		expect(listPathLessonIds(proPath)).toEqual([
			'what-is-git',
			'setup',
			'three-areas',
			'ignoring-files'
		]);
	});

	it('lists the Book path in chapter order, each lesson once', () => {
		expect(listBookPathLessonIds(bookPath)).toEqual([
			'what-is-git',
			'three-areas',
			'ignoring-files'
		]);
	});

	it('takes the core lessons from the first modules only', () => {
		expect(listCoreLessonIds(proPath, 1)).toEqual(['what-is-git', 'setup']);
	});
});

describe('findContinueLessonId', () => {
	it('continues the last opened lesson', () => {
		const lessonIds = listPathLessonIds(proPath);
		expect(findContinueLessonId(place({ lastOpenedLessonId: 'setup' }), lessonIds)).toBe('setup');
	});

	it('has nothing to continue for a new student', () => {
		expect(findContinueLessonId(place({}), listPathLessonIds(proPath))).toBeNull();
	});

	it('ignores a saved lesson that is no longer in the path', () => {
		const lessonIds = listPathLessonIds(proPath);
		expect(findContinueLessonId(place({ lastOpenedLessonId: 'removed' }), lessonIds)).toBeNull();
	});
});

describe('findUpNextLessonIds', () => {
	it('lists the next unfinished lessons after the current one, in path order', () => {
		const student = place({ lastOpenedLessonId: 'setup', finishedMissions: ['three-areas'] });
		expect(findUpNextLessonIds(student, listPathLessonIds(proPath), 2)).toEqual([
			'ignoring-files',
			'what-is-git'
		]);
	});

	it('starts from the beginning for a new student', () => {
		expect(findUpNextLessonIds(place({}), listPathLessonIds(proPath), 2)).toEqual([
			'what-is-git',
			'setup'
		]);
	});
});

describe('countPathProgress', () => {
	it('counts finished missions among the given lessons', () => {
		const student = place({ finishedMissions: ['setup', 'three-areas', 'not-in-path'] });
		expect(countPathProgress(student, listPathLessonIds(proPath))).toEqual({
			doneCount: 2,
			totalCount: 4
		});
	});
});

describe('isFurtherLayer', () => {
	it('orders the layers Must know, Under the hood, Advanced', () => {
		expect(isFurtherLayer('underTheHood', 'mustKnow')).toBe(true);
		expect(isFurtherLayer('mustKnow', 'advanced')).toBe(false);
		expect(isFurtherLayer('advanced', undefined)).toBe(true);
	});
});
