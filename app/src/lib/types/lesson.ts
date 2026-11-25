/**
 * lesson.ts
 * The shape of one lesson after it is read from content/lessons/<lesson-id>/ (SPEC.md section 4).
 */

import type { Mission } from './mission.ts';
import type { Quiz } from './quiz.ts';

/** The four parts of lesson.md, in the order a student meets them. */
export type LessonSections = {
	mustKnow: string; // "Must know": the commands for everyday work (Markdown)
	underTheHood: string; // "Under the hood": what Git does underneath (Markdown)
	advanced: string; // "Advanced": details and edge cases for experienced users (Markdown)
	recap: string; // "Recap": the short summary card (Markdown)
};

/** The data at the top of lesson.md, between the two "---" lines. */
export type LessonFrontmatter = {
	id: string; // also the folder name, e.g. "three-areas"
	title: string;
	module: string; // the module ID from docs/course-map.md, e.g. "daily-loop"
	bookSection: string; // the Pro Git section shown to students, e.g. "2.2 Recording Changes"
	bookUrl: string; // the section in the official online Pro Git, for the citation link
	bookSources: string[]; // paths of the Pro Git source files under book/
	readFirst: string[]; // lesson IDs worth reading before this one
};

/** One complete lesson: its text, its mission and its quiz. */
export type Lesson = LessonFrontmatter & {
	lede: string; // the one opening sentence before the first section
	sections: LessonSections;
	mission: Mission;
	quiz: Quiz;
};
