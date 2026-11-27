/**
 * render-blocks.ts
 * Splits a lesson section into plain Markdown and the special blocks from docs/DESIGN.md.
 * Authors mark a block with a line ":::name" and close it with a line ":::".
 *
 *   :::careful                      Markdown inside: try-it, careful, sidenote
 *   git add stages the file as it is now.
 *   :::
 *
 *   :::definitions                  YAML inside: definitions (term, area, text), compare (today, book),
 *   - term: Staging area            predict (question, answer), graph (see parse-graph-block.ts)
 *     area: staging
 *     text: The next commit.
 *   :::
 */

import type { CommitGraph } from '../types/commit-graph.ts';
import { ContentError } from './content-error.ts';
import { FieldReader } from './field-reader.ts';
import { parseGraphBlock } from './parse-graph-block.ts';

/** One of Git's three areas, for the colored swatch beside a definition. */
export type GitArea = 'working' | 'staging' | 'repository';

/** One term in a definitions block. */
export type DefinitionItem = { term: string; area: GitArea | null; text: string };

/** A piece of a lesson section: plain text or one special block. */
export type LessonBlock =
	| { kind: 'markdown'; markdown: string }
	| { kind: 'try-it'; markdown: string }
	| { kind: 'careful'; markdown: string }
	| { kind: 'sidenote'; markdown: string }
	| { kind: 'definitions'; items: DefinitionItem[] }
	| { kind: 'compare'; today: string; book: string }
	| { kind: 'predict'; question: string; answer: string }
	| { kind: 'graph'; graph: CommitGraph };

const markdownBlockNames = ['try-it', 'careful', 'sidenote'] as const;
const yamlBlockNames = ['definitions', 'compare', 'predict', 'graph'] as const;
const gitAreas: readonly GitArea[] = ['working', 'staging', 'repository'];

/**
 * Splits a section into blocks, in file order.
 * @param markdown - one lesson section
 * @param fileName - the lesson file, for error messages
 * @returns the blocks; plain text between blocks becomes "markdown" blocks
 * @throws ContentError for an unknown, unclosed or badly filled block
 */
export function splitIntoBlocks(markdown: string, fileName: string): LessonBlock[] {
	const blocks: LessonBlock[] = [];
	let plainLines: string[] = [];
	let openBlock: { name: string; lines: string[] } | null = null;
	let isInsideCodeBlock = false;

	for (const line of markdown.split('\n')) {
		if (line.trimStart().startsWith('```')) {
			isInsideCodeBlock = !isInsideCodeBlock;
		}
		const isMarker = !isInsideCodeBlock && line.startsWith(':::');
		if (!isMarker) {
			(openBlock?.lines ?? plainLines).push(line);
			continue;
		}
		if (openBlock === null) {
			pushPlainText(blocks, plainLines);
			plainLines = [];
			openBlock = { name: line.slice(3).trim(), lines: [] };
			continue;
		}
		blocks.push(buildBlock(openBlock.name, openBlock.lines.join('\n').trim(), fileName));
		openBlock = null;
	}

	if (openBlock !== null) {
		throw new ContentError(fileName, `the ":::${openBlock.name}" block is never closed`);
	}
	pushPlainText(blocks, plainLines);
	return blocks;
}

/**
 * Adds the collected plain lines as a markdown block, unless they are only blank lines.
 * @param blocks - the blocks so far (changed in place)
 * @param plainLines - the lines since the last block
 */
function pushPlainText(blocks: LessonBlock[], plainLines: string[]): void {
	const markdown = plainLines.join('\n').trim();
	if (markdown !== '') {
		blocks.push({ kind: 'markdown', markdown });
	}
}

/**
 * Builds one special block from its name and body.
 * @param blockName - the word after ":::"
 * @param body - the text between the markers
 * @param fileName - for error messages
 * @returns the typed block
 */
function buildBlock(blockName: string, body: string, fileName: string): LessonBlock {
	const markdownBlockName = markdownBlockNames.find((name) => name === blockName);
	if (markdownBlockName !== undefined) {
		return { kind: markdownBlockName, markdown: body };
	}
	if (!(yamlBlockNames as readonly string[]).includes(blockName)) {
		throw new ContentError(fileName, `unknown block ":::${blockName}"`);
	}
	const blockFileName = `${fileName} (":::${blockName}" block)`;
	if (blockName === 'compare') {
		const reader = FieldReader.fromYaml(body, blockFileName);
		return { kind: 'compare', today: reader.text('today'), book: reader.text('book') };
	}
	if (blockName === 'predict') {
		const reader = FieldReader.fromYaml(body, blockFileName);
		return { kind: 'predict', question: reader.text('question'), answer: reader.text('answer') };
	}
	if (blockName === 'graph') {
		return { kind: 'graph', graph: parseGraphBlock(body, blockFileName) };
	}
	return { kind: 'definitions', items: readDefinitions(body, blockFileName) };
}

/**
 * Reads the YAML list of a definitions block.
 * @param body - the YAML text
 * @param blockFileName - the file and block, for error messages
 * @returns the definition items
 */
function readDefinitions(body: string, blockFileName: string): DefinitionItem[] {
	const wrapper = FieldReader.fromYaml(`items:\n${indent(body)}`, blockFileName);
	return wrapper.recordList('items', 'item').map((itemReader) => {
		const areaText = itemReader.optionalText('area');
		const area = gitAreas.find((gitArea) => gitArea === areaText) ?? null;
		if (areaText !== null && area === null) {
			itemReader.fail('"area" must be working, staging or repository');
		}
		return { term: itemReader.text('term'), area, text: itemReader.text('text') };
	});
}

/**
 * Indents every line by two spaces, so a YAML list can sit under a parent field.
 * @param text - YAML lines
 * @returns the indented lines
 */
function indent(text: string): string {
	return text
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n');
}
