/**
 * tests/github/vitest.config.ts
 * Settings for `pnpm test:github`: runs every GitHub challenge on the account signed in to
 * `gh` on this computer. Kept apart from the other tests: it needs the network and an account.
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'github',
		environment: 'node',
		include: ['tests/github/**/*.test.ts'],
		expect: { requireAssertions: true },
		hookTimeout: 600_000,
		// A challenge waits up to three minutes for GitHub (an Actions run, say).
		testTimeout: 300_000,
		// The challenges share practice repositories, so they must not run at the same time.
		fileParallelism: false
	}
});
