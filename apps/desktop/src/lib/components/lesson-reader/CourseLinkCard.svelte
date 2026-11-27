<!--
  CourseLinkCard.svelte
  The small card shown under a link to a glossary term or another lesson, while the link is
  hovered or focused: the title, a sentence or two, and what clicking does. It is a tooltip:
  nothing in it can be clicked, the link itself goes there, and the link names the card as its
  description, so screen readers read it too.

  Inputs: cardId (the element ID the link points to), info (the card's text),
          anchorRect (the link's position on screen, to place the card under it).
-->
<script lang="ts">
	import type { CourseLinkInfo } from '$lib/content/course-link-info';

	let { cardId, info, anchorRect }: { cardId: string; info: CourseLinkInfo; anchorRect: DOMRect } =
		$props();

	/** The card's width in rem (20rem), used to keep it inside the window. */
	const cardWidthInRem = 20;

	/** Keeps the card inside the window: under the link, moved left if it would overflow. */
	const position = $derived.by(() => {
		const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const cardWidth = cardWidthInRem * remInPixels;
		const left = Math.min(anchorRect.left, window.innerWidth - cardWidth - remInPixels);
		return { top: anchorRect.bottom + remInPixels / 3, left: Math.max(remInPixels / 2, left) };
	});
</script>

<div
	id={cardId}
	role="tooltip"
	style:top={`${position.top}px`}
	style:left={`${position.left}px`}
	class="pointer-events-none fixed z-50 flex w-80 flex-col gap-1.5 rounded-medium border bg-surface px-4 py-3 shadow-floating"
>
	<span class="type-body font-semibold text-ink">{info.title}</span>
	<span class="type-small text-ink-muted">{info.text}</span>
	<span class="type-caption text-ink-faint">{info.actionText}</span>
</div>
