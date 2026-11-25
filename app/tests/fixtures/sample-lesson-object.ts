/**
 * sample-lesson-object.ts
 * A small, complete lesson as a ready-made object, for component tests that run in the browser
 * (where the sample files on disk cannot be read).
 */

import type { Lesson } from '../../src/lib/types/lesson.ts';

/** A lesson with every field filled in and one recognisable sentence per section. */
export const sampleLesson: Lesson = {
	id: 'sample-lesson',
	title: 'A sample lesson',
	module: 'daily-loop',
	bookSection: '2.2 Recording Changes',
	bookUrl: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
	bookSources: ['book/progit2/book/02-git-basics/sections/recording-changes.asc'],
	readFirst: [],
	lede: 'This sentence is the lede.',
	sections: {
		useIt: 'Use it text with `git status`.',
		howItWorks: 'How it works text.',
		pro: 'Pro text.',
		recap: '- Recap point.'
	},
	mission: {
		brief: 'Commit notes.txt.',
		setup: ['git init'],
		goals: [{ check: 'file-is-committed', file: 'notes.txt', label: 'notes.txt is committed' }],
		hints: ['First hint', 'Second hint', 'Third hint'],
		solution: ['git add notes.txt', 'git commit -m "Add notes"']
	},
	quiz: {
		questions: [
			{
				question: 'Where does an edit go first?',
				answers: [
					{ text: 'The working folder', isCorrect: true, explanation: 'Edits start there.' },
					{ text: 'The repository', isCorrect: false, explanation: 'Only commits go there.' }
				]
			},
			{
				question: 'What does git add do?',
				answers: [
					{ text: 'Makes a commit', isCorrect: false, explanation: 'git commit does that.' },
					{ text: 'Stages a file', isCorrect: true, explanation: 'It stages the file.' }
				]
			}
		]
	}
};
