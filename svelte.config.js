/**
 * svelte.config.js
 * Tells SvelteKit how to build the screens.
 * We use adapter-static: the build is plain HTML, CSS and JavaScript files that Tauri loads.
 * The "fallback" page lets any route (like /lessons/three-areas) open from that one index.html.
 * See https://svelte.dev/docs/kit/single-page-apps and https://v2.tauri.app/start/frontend/sveltekit/
 */

import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		/**
		 * Adds our config files and build scripts to the TypeScript project SvelteKit generates,
		 * so type checks and ESLint cover them too.
		 */
		typescript: {
			/**
			 * Adds our extra files to the generated tsconfig.
			 * @param {Record<string, unknown>} tsconfig - the tsconfig SvelteKit is about to write
			 */
			config: (tsconfig) => {
				const includedFiles = /** @type {string[]} */ (tsconfig.include);
				includedFiles.push(
					'../*.config.js',
					'../*.config.ts',
					'../scripts/**/*.ts',
					'../tests/**/*.ts',
					'../tools/**/*.ts'
				);
			}
		},
		adapter: adapter({
			fallback: 'index.html'
		})
	}
};

export default config;
