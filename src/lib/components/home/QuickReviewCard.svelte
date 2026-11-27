<!--
  QuickReviewCard.svelte
  "Quick review": one quiz question from a lesson the student already worked on, answered
  right here, so old lessons come back now and then.

  Input: pick (the question and its lesson's title, or null before any lesson is done).
-->
<script lang="ts">
	import type { ReviewPick } from '$lib/progress/quick-review';
	import QuizQuestionCard from '$lib/components/quiz/QuizQuestionCard.svelte';
	import HomeCard from './HomeCard.svelte';

	let { pick }: { pick: (ReviewPick & { lessonTitle: string }) | null } = $props();

	/** The home card keeps no score, so a checked answer needs nothing more. */
	function ignoreCheckedAnswer(): void {}
</script>

<HomeCard title="Quick review">
	{#snippet aside()}
		{#if pick !== null}
			<span class="type-small text-ink-muted">from {pick.lessonTitle}</span>
		{/if}
	{/snippet}
	{#if pick === null}
		<p class="type-small m-0 text-ink-muted">
			Finish a lesson, and a question from its quiz comes back here to keep it fresh.
		</p>
	{:else}
		<QuizQuestionCard question={pick.question} questionNumber={1} onchecked={ignoreCheckedAnswer} />
	{/if}
</HomeCard>
