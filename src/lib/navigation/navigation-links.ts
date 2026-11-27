/**
 * navigation-links.ts
 * The app's main links (sidebar and rail) and the rule for which one is the current page.
 */

import type { Pathname } from '$app/types';

/** The icons the navigation can show; drawn by NavigationIcon.svelte. */
export type NavigationIconName = 'home' | 'course-map' | 'commands' | 'settings';

/** One main link. */
export type NavigationLink = {
	href: Pathname; // a real route, checked by SvelteKit's types
	label: string;
	icon: NavigationIconName;
};

/** The main links, in the order the sidebar shows them. */
export const mainLinks: readonly NavigationLink[] = [
	{ href: '/', label: 'Home', icon: 'home' },
	{ href: '/course-map', label: 'Course map', icon: 'course-map' },
	{ href: '/commands', label: 'Command index', icon: 'commands' },
	{ href: '/settings', label: 'Settings', icon: 'settings' }
];

/**
 * Decides whether a link points at the page being shown (or a page inside it).
 * @param currentPath - the path of the page on screen, like "/course-map/book-path"
 * @param linkHref - the link's target, like "/course-map"
 * @returns true if the link should be marked as the current page
 */
export function isLinkActive(currentPath: string, linkHref: string): boolean {
	if (linkHref === '/') {
		return currentPath === '/';
	}
	const isSamePage = currentPath === linkHref;
	const isPageInside = currentPath.startsWith(`${linkHref}/`);
	return isSamePage || isPageInside;
}
