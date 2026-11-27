/**
 * search-items.ts
 * Searches the index and groups the results. Every word typed must appear somewhere in an
 * item; items whose title or tag match rank above items that only match in their text.
 * It is a plain loop over a few hundred items, so it stays far under 50 ms while typing.
 */

import type { SearchItem, SearchKind } from './search-index';

/** One group of results, as shown under a heading. */
export type ResultGroup = { kind: SearchKind; heading: string; items: SearchItem[] };

/** The order and headings of the groups. */
export const resultGroupOrder: { kind: SearchKind; heading: string }[] = [
	{ kind: 'lesson', heading: 'Lessons' },
	{ kind: 'command', heading: 'Commands' },
	{ kind: 'term', heading: 'Terms' },
	{ kind: 'book', heading: 'Pro Git' }
];

/** Points for one typed word, by where it matched. */
const matchPoints = { titleStart: 60, title: 40, tag: 50, snippet: 10, keywords: 20 };

/**
 * Finds the items that match a query, best first.
 * @param index - every searchable item
 * @param query - what the student typed
 * @returns the matching items, ranked; none for an empty query
 */
export function searchItems(index: SearchItem[], query: string): SearchItem[] {
	const words = query
		.toLowerCase()
		.split(/\s+/)
		.filter((word) => word !== '');
	if (words.length === 0) {
		return [];
	}
	const scored: { item: SearchItem; score: number }[] = [];
	for (const item of index) {
		const score = scoreItem(item, words);
		if (score > 0) {
			scored.push({ item, score });
		}
	}
	scored.sort((first, second) => second.score - first.score);
	return scored.map((entry) => entry.item);
}

/**
 * Scores one item: the sum of each word's best match, or 0 when any word does not match.
 * @param item - the item
 * @param words - the typed words, in lower case
 * @returns the score
 */
function scoreItem(item: SearchItem, words: string[]): number {
	const title = item.title.toLowerCase();
	const tag = item.tag.toLowerCase();
	const snippet = item.snippet.toLowerCase();
	const keywords = item.keywords.toLowerCase();
	let total = 0;
	for (const word of words) {
		const wordScore = Math.max(
			title.startsWith(word) ? matchPoints.titleStart : 0,
			title.includes(word) ? matchPoints.title : 0,
			tag.includes(word) ? matchPoints.tag : 0,
			snippet.includes(word) ? matchPoints.snippet : 0,
			keywords.includes(word) ? matchPoints.keywords : 0
		);
		if (wordScore === 0) {
			return 0;
		}
		total += wordScore;
	}
	return total;
}

/**
 * Groups ranked results by kind, in the fixed group order; each group keeps the ranking.
 * @param results - ranked items
 * @param limitPerGroup - how many to keep per group (the quick panel shows only a few)
 * @returns the non-empty groups
 */
export function groupResults(results: SearchItem[], limitPerGroup = Infinity): ResultGroup[] {
	return resultGroupOrder
		.map(({ kind, heading }) => ({
			kind,
			heading,
			items: results.filter((item) => item.kind === kind).slice(0, limitPerGroup)
		}))
		.filter((group) => group.items.length > 0);
}

/**
 * Moves the highlighted result with the arrow keys, wrapping at both ends.
 * @param currentIndex - the highlighted result's position, or -1 for none
 * @param key - "ArrowDown" or "ArrowUp" (other keys do not move)
 * @param resultCount - how many results are shown
 * @returns the new position, or null when the key does not move it
 */
export function moveHighlight(
	currentIndex: number,
	key: string,
	resultCount: number
): number | null {
	if (resultCount === 0) {
		return null;
	}
	if (key === 'ArrowDown') {
		return (currentIndex + 1) % resultCount;
	}
	if (key === 'ArrowUp') {
		return currentIndex <= 0 ? resultCount - 1 : currentIndex - 1;
	}
	return null;
}
