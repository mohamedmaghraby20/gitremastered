<!--
  LessonMarkdown.svelte
  Shows one piece of lesson Markdown as HTML, in the lesson's reading styles (lesson-prose.css).
  Links to glossary terms and other lessons (course links) get a hover card on hover or
  keyboard focus (Esc hides it). Clicking one opens its destination inside the app and, in a
  lesson, remembers the way back (the next lesson shows "← Back to …").

  Input: markdown, the text from a lesson section.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { renderMarkdown } from '@gitremastered/course-engine/content/render-markdown';
	import { parseCourseLink } from '@gitremastered/course-engine/content/course-links';
	import { describeCourseLink, type CourseLinkInfo } from '$lib/content/course-link-info';
	import { findLessonPlaceReader } from '$lib/navigation/lesson-place-context';
	import { rememberReturnPoint } from '$lib/navigation/return-point.svelte';
	import CourseLinkCard from './CourseLinkCard.svelte';

	let { markdown }: { markdown: string } = $props();

	const html = $derived(renderMarkdown(markdown));
	const readLessonPlace = findLessonPlaceReader();

	/** A unique ID for this text's card, so the link can name it as its description. */
	const cardId = `course-link-card-${Math.random().toString(36).slice(2)}`;

	let shownCard: { info: CourseLinkInfo; anchorRect: DOMRect; link: HTMLAnchorElement } | null =
		$state(null);

	/**
	 * Finds the course link an event happened on.
	 * @param event - any event inside the text
	 * @returns the link element, or null when the event was not on a course link
	 */
	function findCourseLinkElement(event: Event): HTMLAnchorElement | null {
		return (event.target as Element | null)?.closest<HTMLAnchorElement>('a.course-link') ?? null;
	}

	/**
	 * Shows the card for a course link.
	 * @param linkElement - the hovered or focused link
	 */
	function showCard(linkElement: HTMLAnchorElement): void {
		const link = parseCourseLink(`${linkElement.dataset.linkKind}:${linkElement.dataset.linkId}`);
		if (link === null) {
			return;
		}
		shownCard?.link.removeAttribute('aria-describedby');
		linkElement.setAttribute('aria-describedby', cardId);
		shownCard = {
			info: describeCourseLink(link),
			anchorRect: linkElement.getBoundingClientRect(),
			link: linkElement
		};
	}

	/** Hides the card, if one is shown. */
	function hideCard(): void {
		shownCard?.link.removeAttribute('aria-describedby');
		shownCard = null;
	}

	/**
	 * Shows the card when the pointer or keyboard focus reaches a course link.
	 * @param event - pointerover or focusin
	 */
	function handleEnter(event: Event): void {
		const linkElement = findCourseLinkElement(event);
		if (linkElement !== null) {
			showCard(linkElement);
		}
	}

	/**
	 * Hides the card when the pointer or focus leaves the link (not when it moves inside it).
	 * @param event - pointerout or focusout
	 */
	function handleLeave(event: PointerEvent | FocusEvent): void {
		const nextTarget = event.relatedTarget as Node | null;
		if (shownCard !== null && !shownCard.link.contains(nextTarget)) {
			hideCard();
		}
	}

	/**
	 * Hides the card with Esc (WCAG 1.4.13: extra content can be dismissed).
	 * @param keyEvent - a key press inside the text
	 */
	function handleKey(keyEvent: KeyboardEvent): void {
		if (keyEvent.key === 'Escape' && shownCard !== null) {
			hideCard();
		}
	}

	/**
	 * Opens a course link's destination in the app and remembers the way back.
	 * @param mouseEvent - a click inside the text
	 */
	function handleClick(mouseEvent: MouseEvent): void {
		const linkElement = findCourseLinkElement(mouseEvent);
		const link =
			linkElement === null
				? null
				: parseCourseLink(`${linkElement.dataset.linkKind}:${linkElement.dataset.linkId}`);
		if (link === null) {
			return;
		}
		mouseEvent.preventDefault();
		hideCard();
		const info = describeCourseLink(link);
		const place = readLessonPlace?.();
		if (place !== undefined && info.destinationLessonId !== null) {
			rememberReturnPoint({
				fromLessonId: place.lessonId,
				fromTitle: place.title,
				layerId: place.layerId,
				scrollTop: place.scrollTop,
				toLessonId: info.destinationLessonId
			});
		}
		// The address comes from our own content and points inside the app.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		void goto(info.destinationHref);
	}
</script>

<!-- The handlers only watch for course links inside the text; the links themselves are the
     interactive elements, so the wrapper needs no role of its own. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="lesson-prose"
	onpointerover={handleEnter}
	onpointerout={handleLeave}
	onfocusin={handleEnter}
	onfocusout={handleLeave}
	onkeydown={handleKey}
	onclick={handleClick}
>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
	{@html html}
</div>

{#if shownCard !== null}
	<CourseLinkCard {cardId} info={shownCard.info} anchorRect={shownCard.anchorRect} />
{/if}
