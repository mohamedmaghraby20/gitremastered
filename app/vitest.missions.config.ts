/**
 * vitest.missions.config.ts
 * Settings for `pnpm test:missions`: runs every lesson's mission with real Git and the real
 * Rust snapshot reader. Kept apart from `pnpm test` because it needs Git, bash and Cargo.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'missions',
		environment: 'node',
		include: ['tests/missions/**/*.test.ts'],
		expect: { requireAssertions: true },
		// The first run compiles the Rust snapshot printer, which can take a while.
		hookTimeout: 600_000,
		testTimeout: 60_000
	}
});
