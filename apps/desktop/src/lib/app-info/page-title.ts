/**
 * page-title.ts
 * Builds the text shown in the window's title bar, like "Course map · GitRemastered".
 */

/** The app's name, as shown to students. */
export const appName = 'GitRemastered';

/**
 * Builds the title for one page.
 * @param pageName - the page's name, like "Course map"; leave it out for the home page
 * @returns "<page name> · GitRemastered", or just "GitRemastered" when there is no page name
 */
export function buildPageTitle(pageName?: string): string {
	const trimmedPageName = pageName?.trim() ?? '';
	if (trimmedPageName === '') {
		return appName;
	}
	return `${trimmedPageName} · ${appName}`;
}
