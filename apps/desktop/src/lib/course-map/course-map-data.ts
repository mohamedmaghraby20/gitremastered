/**
 * course-map-data.ts
 * Builds what the course map shows, only from the path files and saved progress:
 * - the Pro path: modules, each with its lessons (number, title, source, time, status);
 * - the Book path: Pro Git chapters, their sections, and the lessons that teach each.
 */

import {
	getBookPath,
	getLessonCard,
	getProPath,
	type LessonCard
} from '$lib/content/course-content';
import type { StudentPlace } from '$lib/progress/learning-summary';

/** Where the student is with a lesson: finished, the one open now, or not started. */
export type LessonStatus = 'done' | 'current' | 'todo';

/** One lesson row: its card plus its status. */
export type LessonRow = LessonCard & { status: LessonStatus };

/** One module of the Pro path. */
export type ModuleGroup = {
	id: string;
	numberLabel: string; // "00", "01"…
	title: string;
	summary: string; // e.g. "1 of 2 done", or "2 lessons"
	rows: LessonRow[];
};

/** One section of Pro Git with its lessons. */
export type SectionGroup = { number: string; title: string; rows: LessonRow[] };

/** One chapter of Pro Git. */
export type ChapterGroup = { number: number; title: string; sections: SectionGroup[] };

/**
 * Lists the Pro path's modules with their lesson rows.
 * @param student - the saved progress
 * @returns the modules in order (none if the path file is missing)
 */
export function buildProModules(student: StudentPlace): ModuleGroup[] {
	const proPath = getProPath();
	if (proPath === undefined) {
		return [];
	}
	return proPath.modules.map((pathModule, moduleIndex) => {
		const rows = toRows(pathModule.lessonIds, student);
		return {
			id: pathModule.id,
			numberLabel: String(moduleIndex).padStart(2, '0'),
			title: pathModule.title,
			summary: summarizeModule(rows),
			rows
		};
	});
}

/**
 * Finds the module the student is in: the one holding the last opened lesson, or the first.
 * @param modules - the Pro path's modules, from buildProModules
 * @returns that module, or undefined when there are no modules
 */
export function findCurrentModule(modules: ModuleGroup[]): ModuleGroup | undefined {
	const moduleWithCurrentLesson = modules.find((group) =>
		group.rows.some((row) => row.status === 'current')
	);
	return moduleWithCurrentLesson ?? modules[0];
}

/**
 * Lists the Book path's chapters, sections and lesson rows.
 * @param student - the saved progress
 * @returns the chapters in order (none if the Book path file is missing)
 */
export function buildBookChapters(student: StudentPlace): ChapterGroup[] {
	const bookPath = getBookPath();
	if (bookPath === null) {
		return [];
	}
	return bookPath.chapters.map((chapter) => ({
		number: chapter.number,
		title: chapter.title,
		sections: chapter.sections.map((section) => ({
			number: section.number,
			title: section.title,
			rows: toRows(section.lessonIds, student)
		}))
	}));
}

/**
 * Counts the lessons of every module, for the page's eyebrow.
 * @returns how many lessons the Pro path lists
 */
export function countCourseLessons(): number {
	const proPath = getProPath();
	return (
		proPath?.modules.reduce((total, pathModule) => total + pathModule.lessonIds.length, 0) ?? 0
	);
}

/**
 * Turns lesson IDs into rows with a status.
 * @param lessonIds - the lessons, in order
 * @param student - the saved progress
 * @returns the rows (unknown IDs are skipped; the content check already rejects them)
 */
function toRows(lessonIds: string[], student: StudentPlace): LessonRow[] {
	const rows: LessonRow[] = [];
	for (const lessonId of lessonIds) {
		const card = getLessonCard(lessonId);
		if (card !== undefined) {
			rows.push({ ...card, status: findLessonStatus(lessonId, student) });
		}
	}
	return rows;
}

/**
 * Finds a lesson's status. A finished lesson stays "done" even while it is open again.
 * @param lessonId - the lesson
 * @param student - the saved progress
 * @returns "done", "current" or "todo"
 */
export function findLessonStatus(lessonId: string, student: StudentPlace): LessonStatus {
	if (student.finishedLessons.includes(lessonId)) {
		return 'done';
	}
	if (student.lastOpenedLessonId === lessonId) {
		return 'current';
	}
	return 'todo';
}

/**
 * Sums up a module in a few words.
 * @param rows - the module's lesson rows
 * @returns "In progress", "2 of 3 done", or "3 lessons"
 */
function summarizeModule(rows: LessonRow[]): string {
	const doneCount = rows.filter((row) => row.status === 'done').length;
	if (rows.some((row) => row.status === 'current')) {
		return 'In progress';
	}
	if (doneCount > 0) {
		return `${doneCount} of ${rows.length} done`;
	}
	return rows.length === 1 ? '1 lesson' : `${rows.length} lessons`;
}
