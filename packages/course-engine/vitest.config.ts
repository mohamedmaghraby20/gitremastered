/**
 * vitest.config.ts
 * Settings for Vitest, the test runner for the course engine (`pnpm test`).
 * Every engine test is plain logic, so they all run in Node.js; no browser is needed.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'course-engine',
		environment: 'node',
		include: ['src/**/*.test.ts'],
		// A test that checks nothing is a mistake, so it fails.
		expect: { requireAssertions: true }
	}
});
