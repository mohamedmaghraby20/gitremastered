/**
 * prettier.config.js
 * Settings for Prettier, which formats the code the same way for everyone (`pnpm format`).
 * These are the Svelte project defaults: tabs, single quotes, lines up to 100 characters.
 */

/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
	tailwindStylesheet: './src/app.css'
};

export default config;
