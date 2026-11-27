<!--
  resize-handle.svelte
  A drag handle between two panels, like the lesson and practice columns. It sits on the line
  between them and takes no space; its grab area is a few pixels wide on each side.
  - Mouse: drag it. Double-click: back to the design's default split.
  - Keyboard: Tab to it (a focus ring shows), arrows move it 2%, Home and End jump to the limits.
  - Screen readers hear a separator with its label and the first panel's share in percent.
  The handle measures the panels right before and after it, so the two panels' sizes always
  add up to 100%, whatever padding or gaps surround them.

  Inputs:  direction ("columns": panels side by side, "rows": panels on top of each other),
           label (e.g. "Resize the lesson and practice columns"),
           limits (the first panel's smallest and largest share),
           onresize (called with the first panel's new share while dragging and after a key),
           onreset (called on double-click), onresizeend (called once a drag ends, to save),
           class (optional extra classes, e.g. to hide the handle in a small window).
-->
<script lang="ts">
	import { shareFromKey, shareFromPointer, type ShareLimits } from '$lib/layout/panel-sizes';

	let {
		direction,
		label,
		limits,
		onresize,
		onresizeend,
		onreset,
		class: extraClasses = ''
	}: {
		direction: 'columns' | 'rows';
		label: string;
		limits: ShareLimits;
		onresize: (firstShare: number) => void;
		onresizeend: (firstShare: number) => void;
		onreset: () => void;
		class?: string;
	} = $props();

	let handleElement: HTMLDivElement | undefined = $state();
	let firstShare = $state(50);
	let isDragging = $state(false);

	/**
	 * Measures the two panels around the handle.
	 * @returns where the shared space starts and how big it is, in pixels along the direction
	 */
	function measureSpace(): { start: number; size: number } {
		const firstPanel = handleElement?.previousElementSibling?.getBoundingClientRect();
		const secondPanel = handleElement?.nextElementSibling?.getBoundingClientRect();
		if (firstPanel === undefined || secondPanel === undefined) {
			return { start: 0, size: 0 };
		}
		if (direction === 'columns') {
			return { start: firstPanel.left, size: firstPanel.width + secondPanel.width };
		}
		return { start: firstPanel.top, size: firstPanel.height + secondPanel.height };
	}

	/** Reads the first panel's share as it is on screen now (also when no size was saved). */
	function readShareOnScreen(): number {
		const space = measureSpace();
		const firstPanel = handleElement?.previousElementSibling?.getBoundingClientRect();
		const firstSize = direction === 'columns' ? firstPanel?.width : firstPanel?.height;
		return space.size === 0 || firstSize === undefined
			? 50
			: Math.round((firstSize / space.size) * 100);
	}

	/** Reads the share again, for screen readers: after drawing, on focus, hover and window resize. */
	function refreshShare(): void {
		if (handleElement !== undefined && !isDragging) {
			firstShare = readShareOnScreen();
		}
	}

	$effect(refreshShare);

	/**
	 * Starts a drag: the handle keeps the pointer even when it leaves the thin grab area.
	 * @param pointerEvent - the press on the handle
	 */
	function startDrag(pointerEvent: PointerEvent): void {
		pointerEvent.preventDefault();
		handleElement?.setPointerCapture(pointerEvent.pointerId);
		isDragging = true;
	}

	/**
	 * Follows the pointer while dragging.
	 * @param pointerEvent - the pointer's move
	 */
	function followPointer(pointerEvent: PointerEvent): void {
		if (!isDragging) {
			return;
		}
		const space = measureSpace();
		const pointerPosition = direction === 'columns' ? pointerEvent.clientX : pointerEvent.clientY;
		firstShare = shareFromPointer(pointerPosition, space.start, space.size, limits);
		onresize(firstShare);
	}

	/**
	 * Ends a drag and reports the final share, so it can be saved.
	 * @param pointerEvent - the release
	 */
	function endDrag(pointerEvent: PointerEvent): void {
		if (!isDragging) {
			return;
		}
		isDragging = false;
		handleElement?.releasePointerCapture(pointerEvent.pointerId);
		onresizeend(firstShare);
	}

	/**
	 * Moves the handle with the arrow keys, Home and End.
	 * @param keyEvent - the key press while the handle has focus
	 */
	function handleKey(keyEvent: KeyboardEvent): void {
		// Start from the last value, not the screen: quick presses can come before a redraw.
		const newShare = shareFromKey(firstShare, keyEvent.key, limits);
		if (newShare === null) {
			return;
		}
		keyEvent.preventDefault();
		firstShare = newShare;
		onresize(newShare);
		onresizeend(newShare);
	}

	/** Goes back to the design's default split, then reads the share again. */
	function resetSplit(): void {
		onreset();
		requestAnimationFrame(() => (firstShare = readShareOnScreen()));
	}
</script>

<svelte:window onresize={refreshShare} />

<!-- A focusable separator with a value is the WAI-ARIA "window splitter" widget, which is
     interactive by design; Svelte's checker counts every separator as static. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
	bind:this={handleElement}
	role="separator"
	tabindex="0"
	aria-label={label}
	aria-orientation={direction === 'columns' ? 'vertical' : 'horizontal'}
	aria-valuemin={limits.smallest}
	aria-valuemax={limits.largest}
	aria-valuenow={firstShare}
	aria-valuetext={`${firstShare}%`}
	title="Drag to resize. Double-click to reset."
	onpointerdown={startDrag}
	onpointermove={followPointer}
	onpointerup={endDrag}
	onpointercancel={endDrag}
	ondblclick={resetSplit}
	onfocus={refreshShare}
	onpointerenter={refreshShare}
	onkeydown={handleKey}
	class={[
		'group relative z-10 shrink-0 touch-none outline-none select-none',
		direction === 'columns' ? 'w-0 cursor-col-resize' : 'h-0 cursor-row-resize',
		extraClasses
	]}
>
	<!-- The grab area: a few pixels on each side of the line, highlighted on hover, drag and focus. -->
	<span
		class={[
			'absolute flex items-center justify-center rounded-small transition-colors duration-(--duration-fast)',
			'group-hover:bg-border group-focus-visible:outline-2 group-focus-visible:outline-primary',
			isDragging && 'bg-border',
			direction === 'columns' ? 'inset-y-0 -left-1 w-2' : 'inset-x-0 -top-1 h-2'
		]}
	>
		<span
			aria-hidden="true"
			class="type-label-mono text-ink-faint opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
		>
			{direction === 'columns' ? '⋮' : '⋯'}
		</span>
	</span>
</div>
