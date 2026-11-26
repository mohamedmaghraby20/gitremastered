/**
 * search-index.ts
 * Builds the search index: one flat list of everything a student can search for, made from
 * the course content the app already holds in memory (no files, no server). Four kinds:
 * lessons (title, lede and the git commands they use), command pages, glossary terms, and
 * Pro Git sections (from the Book path, each pointing to the lesson that teaches it).
 */

import type { Lesson } from '$lib/types/lesson';
import type { BookPath } from '$lib/types/book-path';
import type { CommandPage, GlossaryTerm } from '$lib/types/reference';

/** What a search result is. */
export type SearchKind = 'lesson' | 'command' | 'term' | 'book';

/** One searchable item. */
export type SearchItem = {
	kind: SearchKind;
	id: string; // unique within its kind
	tag: string; // the short label on the left, e.g. "Lesson 01", "git add", "2.2"
	title: string;
	snippet: string; // one plain line under the title
	href: string; // the app page the result opens
	keywords: string; // extra text that matches but is not shown (e.g. commands a lesson uses)
};

/** The content the index is built from (a slice of the loaded course). */
export type SearchSources = {
	lessons: { lesson: Lesson; numberLabel: string | null }[];
	commands: CommandPage[];
	terms: GlossaryTerm[];
	bookPath: BookPath | null;
	lessonTitles: Map<string, string>; // lesson ID → title, for Pro Git results
};

/**
 * Builds the whole index.
 * @param sources - the loaded content
 * @returns every searchable item, lessons first
 */
export function buildSearchIndex(sources: SearchSources): SearchItem[] {
	return [
		...sources.lessons.map(({ lesson, numberLabel }) => lessonItem(lesson, numberLabel)),
		...sources.commands.map(commandItem),
		...sources.terms.map(termItem),
		...bookItems(sources.bookPath, sources.lessonTitles)
	];
}

/**
 * Makes a lesson searchable by its title, lede and the git commands its text uses.
 * @param lesson - the lesson
 * @param numberLabel - its number in the pro path, like "01", or null
 * @returns the item
 */
function lessonItem(lesson: Lesson, numberLabel: string | null): SearchItem {
	const allText = Object.values(lesson.sections).join('\n');
	return {
		kind: 'lesson',
		id: lesson.id,
		tag: numberLabel === null ? 'Lesson' : `Lesson ${numberLabel}`,
		title: lesson.title,
		snippet: toPlainText(lesson.lede),
		href: `/lessons/${lesson.id}`,
		keywords: findGitCommands(allText).join(' ')
	};
}

/**
 * Makes a command page searchable by its command, summary and usage lines.
 * @param commandPage - the page
 * @returns the item
 */
function commandItem(commandPage: CommandPage): SearchItem {
	return {
		kind: 'command',
		id: commandPage.id,
		tag: commandPage.command,
		title: commandPage.summary,
		snippet: commandPage.usage.join(' · '),
		href: `/commands/${commandPage.id}`,
		keywords: commandPage.group
	};
}

/**
 * Makes a glossary term searchable by its name and meaning.
 * @param term - the term
 * @returns the item
 */
function termItem(term: GlossaryTerm): SearchItem {
	return {
		kind: 'term',
		id: term.id,
		tag: term.term,
		title: term.term,
		snippet: toPlainText(term.meaning),
		href: `/commands/terms#${term.id}`,
		keywords: ''
	};
}

/**
 * Makes each Pro Git section searchable, pointing to the first lesson that teaches it.
 * @param bookPath - the Book path, or null
 * @param lessonTitles - lesson ID → title
 * @returns one item per section
 */
function bookItems(bookPath: BookPath | null, lessonTitles: Map<string, string>): SearchItem[] {
	const sections = bookPath?.chapters.flatMap((chapter) => chapter.sections) ?? [];
	return sections.map((section) => {
		const titles = section.lessonIds.map((lessonId) => lessonTitles.get(lessonId) ?? lessonId);
		return {
			kind: 'book',
			id: section.number,
			tag: section.number,
			title: section.title,
			snippet: `Taught in: ${titles.join(', ')}`,
			href: `/lessons/${section.lessonIds[0]}`,
			keywords: ''
		};
	});
}

/**
 * Finds the git commands a text mentions, like "git add" or "git check-ignore", once each.
 * @param text - lesson Markdown
 * @returns the commands, in the order they first appear
 */
export function findGitCommands(text: string): string[] {
	const matches = text.match(/\bgit [a-z][a-z-]*/g) ?? [];
	return [...new Set(matches)];
}

/**
 * Turns a short piece of Markdown into plain text for a result line.
 * @param markdown - e.g. "Learn `git add` **today**"
 * @returns e.g. "Learn git add today"
 */
export function toPlainText(markdown: string): string {
	return markdown.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
}
