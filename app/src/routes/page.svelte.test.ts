/**
 * page.svelte.test.ts
 * Component test for the home page: it renders in a real browser and shows its title.
 */

import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import HomePage from './+page.svelte';

describe('home page', () => {
	it('shows "Home" as the main heading', async () => {
		await render(HomePage);

		const mainHeading = page.getByRole('heading', { level: 1 });
		await expect.element(mainHeading).toHaveTextContent('Home');
	});
});
