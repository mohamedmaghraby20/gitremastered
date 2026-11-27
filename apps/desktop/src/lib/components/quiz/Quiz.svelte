<!--
  Quiz.svelte
  The lesson's quiz: a heading that says what the quiz is for, then every question as its own
  card, and the score once all are checked.
  Inputs: quiz (from quiz.yaml), onfinish (called once with the score when every question is checked).
-->
<script lang="ts">
	import type { Quiz } from '@gitremastered/course-engine/types/quiz';
	import { scoreQuiz, type QuizScore } from '$lib/quiz/score-quiz';
	import PartHeading from '$lib/components/lesson-reader/PartHeading.svelte';
	import QuizQuestionCard from './QuizQuestionCard.svelte';

	let { quiz, onfinish = () => {} }: { quiz: Quiz; onfinish?: (score: QuizScore) => void } =
		$props();

	// svelte-ignore state_referenced_locally
	let checkedPicks: (number | null)[] = $state(quiz.questions.map(() => null));

	const isFinished = $derived(checkedPicks.every((pick) => pick !== null));
	const score = $derived(scoreQuiz(quiz, checkedPicks));

	/**
	 * Records a checked answer, and reports the score when it was the last one.
	 * @param questionIndex - which question
	 * @param pickedIndex - the picked answer
	 */
	function recordCheckedAnswer(questionIndex: number, pickedIndex: number): void {
		checkedPicks[questionIndex] = pickedIndex;
		if (checkedPicks.every((pick) => pick !== null)) {
			onfinish(scoreQuiz(quiz, checkedPicks));
		}
	}
</script>

<section aria-labelledby="quiz-heading" class="flex flex-col gap-3">
	<PartHeading
		headingId="quiz-heading"
		title="Quiz"
		description="Check what you understood. Pick an answer (or press A–D), then press Check."
	>
		{#snippet aside()}
			{#if isFinished}
				<span class="type-label-mono" role="status">
					{score.correctCount} / {score.questionCount} right
				</span>
			{/if}
		{/snippet}
	</PartHeading>
	{#each quiz.questions as question, questionIndex (question.question)}
		<QuizQuestionCard
			{question}
			questionNumber={questionIndex + 1}
			onchecked={(pickedIndex: number) => recordCheckedAnswer(questionIndex, pickedIndex)}
		/>
	{/each}
</section>
