/**
 * prettier.config.js
 * Prettier settings for the course engine: the same as the app's (../../prettier.config.js)
 * without its Svelte and Tailwind plugins, since the engine is plain TypeScript.
 */

/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100
};

export default config;
