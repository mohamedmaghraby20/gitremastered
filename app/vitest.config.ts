/**
 * vitest.config.ts
 * Settings for Vitest, the test runner for the screens (`pnpm test`).
 *
 * Tests run in two groups ("projects"):
 * - "unit":      plain logic, `*.test.ts`, runs fast in Node.js.
 * - "component": Svelte components, `*.svelte.test.ts`, runs in a real headless Chromium browser,
 *                so clicks, focus and layout behave like in the app window.
 */

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		// A test that checks nothing is a mistake, so it fails.
		expect: { requireAssertions: true },
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
					exclude: ['src/**/*.svelte.test.ts']
				}
			},
			{
				extends: true,
				test: {
					name: 'component',
					include: ['src/**/*.svelte.test.ts'],
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					}
				}
			}
		]
	}
});
