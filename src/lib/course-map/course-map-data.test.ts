/**
 * course-map-data.test.ts
 * Tests for the course map's data, built from the real path files and sample progress.
 */

import { describe, expect, it } from 'vitest';
import {
	buildBookChapters,
	buildProModules,
	countCourseLessons,
	findCurrentModule,
	findLessonStatus,
	type LessonRow
} from './course-map-data';

const newStudent = { finishedMissions: [], lastOpenedLessonId: null };

describe('buildProModules', () => {
	it('lists the modules in path order with numbered lesson rows', () => {
		const modules = buildProModules(newStudent);
		expect(modules[0].numberLabel).toBe('00');
		expect(modules[0].title).toBe('Orientation');
		expect(modules[0].rows.map((row) => row.id)).toEqual([
			'what-is-git',
			'setup',
			'first-look-inside'
		]);
		expect(modules[0].summary).toBe('3 lessons');
		expect(modules[1].title).toBe('Your daily loop');
	});

	it('marks done and current lessons and sums the module up', () => {
		const student = { finishedMissions: ['what-is-git'], lastOpenedLessonId: 'setup' };
		const rows = buildProModules(student)[0].rows;
		expect(rows.map((row) => row.status)).toEqual(['done', 'current', 'todo']);
		expect(buildProModules(student)[0].summary).toBe('In progress');
	});
});

describe('buildBookChapters', () => {
	it('lists chapters and sections with the lessons that teach them', () => {
		const chapters = buildBookChapters(newStudent);
		expect(chapters[0].title).toBe('Getting Started');
		const gitBasics = chapters.find((chapter) => chapter.title === 'Git Basics');
		const sectionTwoTwo = gitBasics?.sections.find((section) => section.number === '2.2');
		expect(sectionTwoTwo?.rows.map((row) => row.id)).toContain('three-areas');
	});
});

describe('findCurrentModule', () => {
	it('picks the module with the current lesson, or the first one', () => {
		const firstModule = { id: 'a', numberLabel: '00', title: 'A', summary: '', rows: [] };
		const currentRow = { status: 'current' } as LessonRow;
		const currentModule = { ...firstModule, id: 'b', rows: [currentRow] };
		expect(findCurrentModule([firstModule, currentModule])?.id).toBe('b');
		expect(findCurrentModule([firstModule])?.id).toBe('a');
		expect(findCurrentModule([])).toBeUndefined();
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
		// The core course: modules 0 to 4. The number only grows as lessons are written.
		expect(countCourseLessons()).toBeGreaterThanOrEqual(23);
	});
});
