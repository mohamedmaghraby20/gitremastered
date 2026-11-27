/**
 * resize-handle.svelte.test.ts
 * Component tests for the resize handle between two panels: a labelled, focusable separator
 * that the arrow keys move within its limits, and that double-click resets.
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ResizeHandleHost from './resize-handle-test-host.svelte';

describe('ResizeHandle', () => {
	it('is a labelled separator showing the first panel share', async () => {
		await render(ResizeHandleHost, { onresize: vi.fn(), onresizeend: vi.fn(), onreset: vi.fn() });

		const handle = page.getByRole('separator', { name: 'Resize the test panels' });
		await expect.element(handle).toHaveAttribute('aria-valuenow', '40');
		await expect.element(handle).toHaveAttribute('aria-orientation', 'vertical');
	});

	it('moves 2% per arrow key and stops at the limits', async () => {
		const onresizeend = vi.fn();
		await render(ResizeHandleHost, { onresize: vi.fn(), onresizeend, onreset: vi.fn() });
		const handle = page.getByRole('separator', { name: 'Resize the test panels' });
		(handle.element() as HTMLElement).focus();

		await userEvent.keyboard('{ArrowRight}{ArrowRight}');
		expect(onresizeend).toHaveBeenLastCalledWith(44);

		await userEvent.keyboard('{End}{ArrowRight}');
		expect(onresizeend).toHaveBeenLastCalledWith(70);
	});

	it('asks to go back to the default on double-click', async () => {
		const onreset = vi.fn();
		await render(ResizeHandleHost, { onresize: vi.fn(), onresizeend: vi.fn(), onreset });

		await page.getByRole('separator', { name: 'Resize the test panels' }).dblClick();

		expect(onreset).toHaveBeenCalledOnce();
	});
});
