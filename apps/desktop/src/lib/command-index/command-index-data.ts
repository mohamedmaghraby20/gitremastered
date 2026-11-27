/**
 * command-index-data.ts
 * Gathers what the command index shows from the course content: the commands in their
 * groups, and each term or command with the list cards of the lessons that teach it.
 */

import {
	getLessonCard,
	getProPath,
	listCommandPages,
	listGlossaryTerms,
	type LessonCard
} from '$lib/content/course-content';
import { listPathLessonIds } from '$lib/progress/learning-summary';
import type { GlossaryTerm } from '@gitremastered/course-engine/types/reference';
import { groupCommands, type CommandGroup } from './group-commands';

/**
 * Lists the commands in their groups, in course order.
 * @returns the groups
 */
export function listCommandGroups(): CommandGroup[] {
	const proPath = getProPath();
	const lessonOrder = proPath === undefined ? [] : listPathLessonIds(proPath);
	return groupCommands(listCommandPages(), lessonOrder);
}

/**
 * Turns lesson IDs into list cards, skipping unknown ones.
 * @param lessonIds - the lessons
 * @returns their cards
 */
export function toLessonCards(lessonIds: string[]): LessonCard[] {
	return lessonIds.map((lessonId) => getLessonCard(lessonId)).filter((card) => card !== undefined);
}

/**
 * Lists every glossary term with the cards of its lessons.
 * @returns the terms, in glossary order
 */
export function listTermsWithLessons(): (GlossaryTerm & { lessonCards: LessonCard[] })[] {
	return listGlossaryTerms().map((term) => ({
		...term,
		lessonCards: toLessonCards(term.lessonIds)
	}));
}
