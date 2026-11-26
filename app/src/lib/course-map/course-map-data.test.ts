/**
 * course-map-data.test.ts
 * Tests for the course map's data, built from the real path files and sample progress.
 */

import { describe, expect, it } from 'vitest';
import {
	buildBookChapters,
	buildProModules,
	countCourseLessons,
	findLessonStatus
} from './course-map-data';

const newStudent = { finishedMissions: [], lastOpenedLessonId: null };

describe('buildProModules', () => {
	it('lists the modules in path order with numbered lesson rows', () => {
		const modules = buildProModules(newStudent);
		expect(modules[0].numberLabel).toBe('00');
		expect(modules[0].title).toBe('Your daily loop');
		expect(modules[0].rows.map((row) => row.id)).toEqual(['three-areas', 'ignoring-files']);
		expect(modules[0].summary).toBe('2 lessons');
	});

	it('marks done and current lessons and sums the module up', () => {
		const student = { finishedMissions: ['three-areas'], lastOpenedLessonId: 'ignoring-files' };
		const rows = buildProModules(student)[0].rows;
		expect(rows.map((row) => row.status)).toEqual(['done', 'current']);
		expect(buildProModules(student)[0].summary).toBe('In progress');
	});
});

describe('buildBookChapters', () => {
	it('lists chapters and sections with the lessons that teach them', () => {
		const chapters = buildBookChapters(newStudent);
		expect(chapters[0].title).toBe('Git Basics');
		expect(chapters[0].sections[0].number).toBe('2.2');
		expect(chapters[0].sections[0].rows.map((row) => row.id)).toContain('three-areas');
	});
});

describe('findLessonStatus', () => {
	it('keeps a finished lesson done even when it is open again', () => {
		const student = { finishedMissions: ['three-areas'], lastOpenedLessonId: 'three-areas' };
		expect(findLessonStatus('three-areas', student)).toBe('done');
	});
});

describe('countCourseLessons', () => {
	it('counts every lesson of the Pro path', () => {
		expect(countCourseLessons()).toBe(2);
	});
});
