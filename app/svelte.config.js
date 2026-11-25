/**
 * svelte.config.js
 * Tells SvelteKit how to build the screens.
 * We use adapter-static: the build is plain HTML, CSS and JavaScript files that Tauri loads.
 * The "fallback" page lets any route (like /lessons/three-areas) open from that one index.html.
 * See https://svelte.dev/docs/kit/single-page-apps and https://v2.tauri.app/start/frontend/sveltekit/
 */

import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
  },
};

export default config;
