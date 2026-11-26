/**
 * lesson-facts.ts
 * Two facts shown next to a lesson in lists (home, course map, search), computed from the
 * lesson itself so nobody has to write them by hand or keep them up to date:
 * - reading time, from the words a student reads before practising;
 * - source label, "Pro Git 2.2" or "Beyond the book".
 */

import type { Lesson } from '../types/lesson.ts';

/**
 * Words a learner reads in a minute. Technical text with commands to study is slower than
 * a novel (about 250); 200 is a common estimate for it.
 */
const wordsPerMinute = 200;

/** The start of every link into the official online Pro Git. */
const proGitUrlStart = 'https://git-scm.com/book/';

/** The parts of a lesson the reading time needs. */
type ReadingParts = {
	sections: Pick<Lesson['sections'], 'mustKnow'>;
	mission: Pick<Lesson['mission'], 'brief'>;
};

/**
 * Estimates how long the lesson's main part takes to read: "Must know" plus the mission brief.
 * @param lesson - the lesson (only its Must know text and mission brief are used)
 * @returns whole minutes, at least 1
 */
export function findReadingMinutes(lesson: ReadingParts): number {
	const wordCount = countWords(lesson.sections.mustKnow) + countWords(lesson.mission.brief);
	return Math.max(1, Math.round(wordCount / wordsPerMinute));
}

/**
 * Names where the lesson comes from.
 * @param lesson - the lesson (only its book section and book link are used)
 * @returns "Pro Git 2.2" for a Pro Git lesson, or "Beyond the book" for other sources
 */
export function findSourceLabel(lesson: Pick<Lesson, 'bookSection' | 'bookUrl'>): string {
	if (!lesson.bookUrl.startsWith(proGitUrlStart)) {
		return 'Beyond the book';
	}
	const sectionNumber = lesson.bookSection.split(' ')[0];
	return `Pro Git ${sectionNumber}`;
}

/**
 * Counts the words in a text.
 * @param text - any text, Markdown included
 * @returns the number of words
 */
function countWords(text: string): number {
	return text.split(/\s+/).filter((word) => word !== '').length;
}
