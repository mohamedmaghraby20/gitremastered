<!--
  +page.svelte (home page, "/")
  The home screen, as in the prototype: "Pick up where you left off" (or "Start the course"
  for a first-time student), then Your path, Up next and Quick review. Everything comes from
  saved progress and the course content (home/home-data.ts); this page only draws it.
  Enter, pressed while nothing on the page has focus, opens the lesson the main button opens.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { progress, saveChosenPath, type CoursePathId } from '$lib/stores/progress';
	import { buildHomeData } from '$lib/home/home-data';
	import { loadPracticeSnapshot } from '$lib/home/load-practice-snapshot';
	import { findDayNumber } from '$lib/progress/quick-review';
	import ContinueCard from '$lib/components/home/ContinueCard.svelte';
	import StartCourseCard from '$lib/components/home/StartCourseCard.svelte';
	import PathCard from '$lib/components/home/PathCard.svelte';
	import UpNextCard from '$lib/components/home/UpNextCard.svelte';
	import QuickReviewCard from '$lib/components/home/QuickReviewCard.svelte';

	const dayNumber = findDayNumber(new Date());
	const homeData = $derived(buildHomeData($progress, dayNumber));

	/** The lesson the main button opens: the one to continue, or the first one. */
	const mainLessonId = $derived(homeData.continueCard?.id ?? homeData.firstLessonCard?.id ?? null);

	let practiceSnapshot: RepoSnapshot | null = $state(null);

	// Reads the practice repository of the lesson to continue, whenever that lesson changes.
	$effect(() => {
		const lessonId = homeData.continueCard?.id;
		practiceSnapshot = null;
		if (lessonId !== undefined) {
			void loadPracticeSnapshot(lessonId).then((snapshot) => (practiceSnapshot = snapshot));
		}
	});

	/**
	 * Opens the main lesson when Enter is pressed and nothing on the page has focus, so Enter
	 * never steals a key press meant for a focused link, button or switch.
	 * @param keyEvent - the key press
	 */
	function handlePageKey(keyEvent: KeyboardEvent): void {
		const isNothingFocused =
			document.activeElement === null || document.activeElement === document.body;
		if (keyEvent.key !== 'Enter' || !isNothingFocused || mainLessonId === null) {
			return;
		}
		keyEvent.preventDefault();
		void goto(resolve('/lessons/[lessonId]', { lessonId: mainLessonId }));
	}

	/**
	 * Saves the path picked on the path card.
	 * @param pathId - "pro-path" or "book-path"
	 */
	function choosePath(pathId: CoursePathId): void {
		void saveChosenPath(pathId);
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Home')}</title>
</svelte:head>

<svelte:window onkeydown={handlePageKey} />

<div class="flex max-w-295 flex-col gap-8 px-12 pt-10 pb-12">
	<div class="flex flex-col gap-2">
		<span class="type-caption text-ink-muted uppercase">
			{homeData.continueCard === null ? 'Welcome' : 'Welcome back'}
		</span>
		<h1 class="type-h1 m-0">
			{homeData.continueCard === null ? 'Start learning Git' : 'Pick up where you left off'}
		</h1>
	</div>

	{#if homeData.continueCard === null}
		<StartCourseCard card={homeData.firstLessonCard} />
	{:else}
		<ContinueCard
			card={homeData.continueCard}
			furthestLayerId={homeData.furthestLayerId}
			snapshot={practiceSnapshot}
		/>
	{/if}

	<div class="grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] items-start gap-4">
		<PathCard
			chosenPathId={$progress.chosenPathId}
			coreProgress={homeData.coreProgress}
			wholeProgress={homeData.wholeProgress}
			onPathChange={choosePath}
		/>
		<UpNextCard cards={homeData.upNextCards} />
		<QuickReviewCard pick={homeData.reviewPick} />
	</div>
</div>
