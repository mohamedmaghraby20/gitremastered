/**
 * parse-lesson.ts
 * Reads the text of one lesson.md: the frontmatter at the top, the lede (the opening sentence),
 * and the four "## " sections: Must know, Under the hood, Advanced, Recap.
 */

import type { LessonFrontmatter, LessonSections } from '../types/lesson.ts';
import { ContentError } from './content-error.ts';
import { FieldReader } from './field-reader.ts';

/** Everything lesson.md holds, before the challenge and quiz are added. */
export type LessonText = {
	frontmatter: LessonFrontmatter;
	lede: string;
	sections: LessonSections;
};

/**
 * The sites a citation link may point to: Pro Git and the Git docs, and GitHub Docs for lessons
 * beyond the book. Keep in sync with the opener permission in src-tauri/capabilities/default.json.
 */
const allowedBookSites = ['https://git-scm.com/', 'https://docs.github.com/'];

/** The section headings authors write, in the required order, and where each one goes. */
const sectionHeadings: { heading: string; key: keyof LessonSections }[] = [
	{ heading: 'Must know', key: 'mustKnow' },
	{ heading: 'Under the hood', key: 'underTheHood' },
	{ heading: 'Advanced', key: 'advanced' },
	{ heading: 'Recap', key: 'recap' }
];

/** One "## " heading and the lines under it. heading is null for the text before any heading. */
type TextChunk = { heading: string | null; lines: string[] };

/**
 * Reads a whole lesson.md.
 * @param fileText - the file's text
 * @param fileName - its path, for error messages
 * @returns the frontmatter, lede and sections
 * @throws ContentError naming the file and the problem
 */
export function parseLessonText(fileText: string, fileName: string): LessonText {
	const unixText = fileText.replaceAll('\r\n', '\n');
	const { frontmatterText, bodyText } = splitFrontmatter(unixText, fileName);
	const frontmatter = readFrontmatter(FieldReader.fromYaml(frontmatterText, fileName));
	const chunks = splitIntoChunks(bodyText, fileName);
	const lede = readLede(chunks, fileName);
	const sections = readSections(chunks, fileName);
	return { frontmatter, lede, sections };
}

/**
 * Separates the frontmatter (between the first two "---" lines) from the rest.
 * @param unixText - the file's text with "\n" line endings
 * @param fileName - for error messages
 * @returns the frontmatter YAML and the Markdown body
 */
export function splitFrontmatter(
	unixText: string,
	fileName: string
): { frontmatterText: string; bodyText: string } {
	const frontmatterPattern = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = frontmatterPattern.exec(unixText);
	if (match === null) {
		throw new ContentError(fileName, 'must start with frontmatter between two "---" lines');
	}
	return { frontmatterText: match[1], bodyText: match[2] };
}

/**
 * Reads the frontmatter fields.
 * @param reader - a reader for the frontmatter YAML
 * @returns the typed frontmatter
 */
function readFrontmatter(reader: FieldReader): LessonFrontmatter {
	return {
		id: reader.text('id'),
		title: reader.text('title'),
		module: reader.text('module'),
		bookSection: reader.text('bookSection'),
		bookUrl: readBookUrl(reader),
		bookSources: reader.textList('bookSources'),
		readFirst: reader.textList('readFirst', 0),
		isCheckpoint: reader.optionalFlag('checkpoint')
	};
}

/**
 * Reads the citation link. It must point at one of the allowed sites, because the desktop app
 * may only open those (see capabilities/default.json).
 * @param reader - a reader for the frontmatter YAML
 * @returns the link
 */
export function readBookUrl(reader: FieldReader): string {
	const bookUrl = reader.text('bookUrl');
	const isOnAllowedSite = allowedBookSites.some((site) => bookUrl.startsWith(site));
	if (!isOnAllowedSite) {
		reader.fail(`"bookUrl" must start with ${allowedBookSites.join(' or ')}`);
	}
	return bookUrl;
}

/**
 * Cuts the Markdown body at every "## " heading, skipping lines inside ``` code blocks.
 * @param bodyText - the Markdown after the frontmatter
 * @param fileName - for error messages
 * @returns the chunks in file order; the first one has no heading
 */
function splitIntoChunks(bodyText: string, fileName: string): TextChunk[] {
	const knownHeadings = sectionHeadings.map((section) => section.heading);
	const chunks: TextChunk[] = [{ heading: null, lines: [] }];
	let isInsideCodeBlock = false;

	for (const line of bodyText.split('\n')) {
		if (line.trimStart().startsWith('```')) {
			isInsideCodeBlock = !isInsideCodeBlock;
		}
		const headingMatch = isInsideCodeBlock ? null : /^## (.+)$/.exec(line);
		if (headingMatch === null) {
			chunks[chunks.length - 1].lines.push(line);
			continue;
		}
		const heading = headingMatch[1].trim();
		if (!knownHeadings.includes(heading)) {
			throw new ContentError(fileName, `unknown section "## ${heading}"`);
		}
		chunks.push({ heading, lines: [] });
	}
	return chunks;
}

/**
 * Reads the lede: the text before the first section.
 * @param chunks - the chunks from splitIntoChunks
 * @param fileName - for error messages
 * @returns the lede text
 */
function readLede(chunks: TextChunk[], fileName: string): string {
	const lede = chunks[0].lines.join('\n').trim();
	if (lede === '') {
		throw new ContentError(fileName, 'the lede is missing (one sentence before "## Must know")');
	}
	return lede;
}

/**
 * Checks that the four sections are all there, once each, in order, and not empty.
 * @param chunks - the chunks from splitIntoChunks
 * @param fileName - for error messages
 * @returns the section texts
 */
function readSections(chunks: TextChunk[], fileName: string): LessonSections {
	const headedChunks = chunks.slice(1);
	const foundHeadings = headedChunks.map((chunk) => chunk.heading);
	const requiredHeadings = sectionHeadings.map((section) => section.heading);

	for (const heading of requiredHeadings) {
		const timesFound = foundHeadings.filter((found) => found === heading).length;
		if (timesFound === 0) {
			throw new ContentError(fileName, `the "## ${heading}" section is missing`);
		}
		if (timesFound > 1) {
			throw new ContentError(fileName, `the "## ${heading}" section appears ${timesFound} times`);
		}
	}
	if (foundHeadings.join('|') !== requiredHeadings.join('|')) {
		const requiredOrder = requiredHeadings.join(', ');
		throw new ContentError(fileName, `sections must be in this order: ${requiredOrder}`);
	}

	const sections: Partial<LessonSections> = {};
	for (const [index, section] of sectionHeadings.entries()) {
		const sectionText = headedChunks[index].lines.join('\n').trim();
		if (sectionText === '') {
			throw new ContentError(fileName, `the "## ${section.heading}" section is empty`);
		}
		sections[section.key] = sectionText;
	}
	return sections as LessonSections;
}
