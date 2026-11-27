/**
 * +layout.ts (root layout settings)
 * Turns off server rendering for the whole app.
 * Tauri has no Node.js server, so every page renders in the window itself (single-page app mode).
 * See https://v2.tauri.app/start/frontend/sveltekit/
 */

// No server rendering: pages are built in the browser window, not ahead of time on a server.
export const ssr = false;
