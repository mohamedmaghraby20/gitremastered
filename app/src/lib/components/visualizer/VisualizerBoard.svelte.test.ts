/**
 * VisualizerBoard.svelte.test.ts
 * Component tests for the board's "Files" fold button: it reports the new state, and a folded
 * desk is hidden while the button says so to screen readers.
 */

import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import VisualizerBoard from './VisualizerBoard.svelte';

describe('VisualizerBoard', () => {
	it('asks to fold the desk when "Files" is clicked', async () => {
		const onDeskToggle = vi.fn();
		await render(VisualizerBoard, { snapshot: null, caption: null, onDeskToggle });

		const filesButton = page.getByRole('button', { name: /Files/ });
		await expect.element(filesButton).toHaveAttribute('aria-expanded', 'true');
		await filesButton.click();

		expect(onDeskToggle).toHaveBeenCalledWith(true);
	});

	it('hides the desk when folded', async () => {
		await render(VisualizerBoard, { snapshot: null, caption: null, isDeskFolded: true });

		await expect
			.element(page.getByRole('button', { name: /Files/ }))
			.toHaveAttribute('aria-expanded', 'false');
		expect(document.getElementById('files-desk')?.hidden).toBe(true);
	});
});
