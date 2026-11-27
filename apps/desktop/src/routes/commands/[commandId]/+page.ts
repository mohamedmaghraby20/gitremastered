/**
 * +page.ts (one command, "/commands/<commandId>")
 * Looks up the command page named in the address and the lessons that teach it.
 * An unknown ID gives commandPage = null, and the page says so.
 */

import type { PageLoad } from './$types';
import { getCommandPage } from '$lib/content/course-content';
import { toLessonCards } from '$lib/command-index/command-index-data';

/**
 * Loads the data the command page needs.
 * @param event - SvelteKit's load event; only params.commandId is used
 * @returns the ID from the address, the command page (or null) and its lessons' cards
 */
export const load: PageLoad = ({ params }) => {
	const commandPage = getCommandPage(params.commandId) ?? null;
	const lessonCards = commandPage === null ? [] : toLessonCards(commandPage.lessonIds);
	return { commandId: params.commandId, commandPage, lessonCards };
};
