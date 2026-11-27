/**
 * link-lessons.ts
 * `pnpm lesson:link`: the link pass of teaching rule 18. While a lesson is being written, it
 * names lessons that do not exist yet in plain text, in quotes: the lesson "Read the commit
 * history". Once those lessons exist, this script turns the first such mention in each
 * lesson into a real link: [Read the commit history](lesson:reading-history).
 *
 * It only touches ordinary text: the frontmatter, code blocks and the YAML blocks (predict,
 * graph, definitions, compare) are left alone. A lesson that already links another lesson
 * is not linked to it twice (rule: link once). Run `pnpm content:check` afterwards.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { contentFolderPath } from '../src/node/read-content-files.ts';

/** Shorter names lessons are known by, besides their full title. */
const extraNames: Record<string, string[]> = {
	'three-areas': ['Status, stage, commit'],
	'first-look-inside': ['A first look inside .git', 'A first look inside `.git`'],
	'how-git-talks': ['How Git talks to servers'],
	'reset-demystified': ['Reset demystified'],
	'diffs-in-depth': ['Read any diff']
};

/** Blocks whose inside is YAML, where a Markdown link would not be read as a link. */
const yamlBlockNames = ['predict', 'graph', 'definitions', 'compare'];

/** One name a lesson can be mentioned by. */
type LessonName = { lessonId: string; name: string };

/**
 * Reads every lesson's title from its frontmatter.
 * @param lessonsFolderPath - content/lessons
 * @returns every name of every lesson, longest first so a full title wins over a short form
 */
function readLessonNames(lessonsFolderPath: string): LessonName[] {
	const lessonNames: LessonName[] = [];
	for (const lessonId of readdirSync(lessonsFolderPath)) {
		const lessonText = readLessonText(lessonsFolderPath, lessonId);
		const titleMatch = /^title: "(.+)"$/m.exec(lessonText ?? '');
		if (titleMatch === null) {
			continue;
		}
		lessonNames.push({ lessonId, name: titleMatch[1] });
		for (const extraName of extraNames[lessonId] ?? []) {
			lessonNames.push({ lessonId, name: extraName });
		}
	}
	return lessonNames.sort((first, second) => second.name.length - first.name.length);
}

/**
 * Reads a lesson's lesson.md.
 * @param lessonsFolderPath - content/lessons
 * @param lessonId - the lesson's folder
 * @returns the text, or null when the entry is not a lesson folder
 */
function readLessonText(lessonsFolderPath: string, lessonId: string): string | null {
	try {
		return readFileSync(join(lessonsFolderPath, lessonId, 'lesson.md'), 'utf8');
	} catch {
		return null;
	}
}

/**
 * Tells, for every line of a lesson, whether links may be added to it.
 * @param lines - the lesson's lines
 * @returns one true/false per line; false inside the frontmatter, code blocks and YAML blocks
 */
function findLinkableLines(lines: string[]): boolean[] {
	let isInFrontmatter = false;
	let isInCodeBlock = false;
	let isInYamlBlock = false;
	return lines.map((line, index) => {
		if (line === '---' && (index === 0 || isInFrontmatter)) {
			isInFrontmatter = !isInFrontmatter;
			return false;
		}
		if (line.trimStart().startsWith('```')) {
			isInCodeBlock = !isInCodeBlock;
			return false;
		}
		if (!isInCodeBlock && line.startsWith(':::')) {
			isInYamlBlock = yamlBlockNames.includes(line.slice(3).trim());
			return false;
		}
		return !isInFrontmatter && !isInCodeBlock && !isInYamlBlock;
	});
}

/**
 * Links the first plain-text mention of each other lesson.
 * @param lessonId - the lesson being edited
 * @param lessonText - its lesson.md
 * @param lessonNames - every name of every lesson, longest first
 * @returns the new text and how many links were added
 */
function linkMentions(
	lessonId: string,
	lessonText: string,
	lessonNames: LessonName[]
): { text: string; linkCount: number } {
	const lines = lessonText.split('\n');
	const linkableLines = findLinkableLines(lines);
	const linkedLessonIds = new Set<string>([lessonId]);
	for (const match of lessonText.matchAll(/\(lesson:([a-z0-9-]+)\)/g)) {
		linkedLessonIds.add(match[1]);
	}
	let linkCount = 0;
	for (const lessonName of lessonNames) {
		if (linkedLessonIds.has(lessonName.lessonId)) {
			continue;
		}
		const quotedName = `"${lessonName.name}"`;
		const lineIndex = lines.findIndex(
			(line, index) => linkableLines[index] && line.includes(quotedName)
		);
		if (lineIndex === -1) {
			continue;
		}
		const link = `[${lessonName.name}](lesson:${lessonName.lessonId})`;
		lines[lineIndex] = lines[lineIndex].replace(quotedName, () => link);
		linkedLessonIds.add(lessonName.lessonId);
		linkCount += 1;
	}
	return { text: lines.join('\n'), linkCount };
}

const lessonsFolderPath = join(contentFolderPath, 'lessons');
const lessonNames = readLessonNames(lessonsFolderPath);
let totalLinkCount = 0;
for (const lessonId of readdirSync(lessonsFolderPath)) {
	const lessonText = readLessonText(lessonsFolderPath, lessonId);
	if (lessonText === null) {
		continue;
	}
	const linked = linkMentions(lessonId, lessonText, lessonNames);
	if (linked.linkCount > 0) {
		writeFileSync(join(lessonsFolderPath, lessonId, 'lesson.md'), linked.text);
		console.log(`${lessonId}: ${linked.linkCount} links`);
		totalLinkCount += linked.linkCount;
	}
}
console.log(`Added ${totalLinkCount} links.`);
