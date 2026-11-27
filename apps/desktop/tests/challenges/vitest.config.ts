/**
 * tests/challenges/vitest.config.ts
 * Settings for `pnpm test:challenges`: runs every lesson's challenge with real Git and the real
 * Rust snapshot reader. Kept apart from `pnpm test` because it needs Git, bash and Cargo.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'challenges',
		environment: 'node',
		include: ['tests/challenges/**/*.test.ts'],
		expect: { requireAssertions: true },
		// The first run compiles the Rust snapshot printer, which can take a while.
		hookTimeout: 600_000,
		testTimeout: 60_000
	}
});
