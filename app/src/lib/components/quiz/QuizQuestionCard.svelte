<!--
  QuizQuestionCard.svelte
  One quiz question: the scenario in serif, lettered answers, and a Check button.
  Answers can be picked by mouse or by pressing A–D while the question has focus.
  After checking, the right answer and a wrong pick are marked, and the explanations show.

  Inputs: question, questionNumber (1-based), onchecked (called with the picked answer's index).
-->
<script lang="ts">
	import type { QuizQuestion } from '$lib/types/quiz';
	import { Button } from '$lib/components/ui/button';
	import { answerIndexForKey, answerLetter, judgeAnswer } from '$lib/quiz/score-quiz';
	import QuizOption from './QuizOption.svelte';

	let {
		question,
		questionNumber,
		onchecked
	}: {
		question: QuizQuestion;
		questionNumber: number;
		onchecked: (pickedIndex: number) => void;
	} = $props();

	let pickedIndex: number | null = $state(null);
	let isChecked = $state(false);

	const outcome = $derived(judgeAnswer(question, pickedIndex));

	/**
	 * Picks an answer with the keyboard (A–D), while the question has focus.
	 * @param keyEvent - the key press
	 */
	function handleKeydown(keyEvent: KeyboardEvent): void {
		if (isChecked || keyEvent.ctrlKey || keyEvent.metaKey || keyEvent.altKey) {
			return;
		}
		const answerIndex = answerIndexForKey(keyEvent.key, question.answers.length);
		if (answerIndex !== null) {
			keyEvent.preventDefault();
			pickedIndex = answerIndex;
		}
	}

	/** Locks the pick, marks the answers and tells the quiz. */
	function checkAnswer(): void {
		if (pickedIndex === null) {
			return;
		}
		isChecked = true;
		onchecked(pickedIndex);
	}

	/**
	 * Decides the mark on one answer after checking.
	 * @param answerIndex - the answer's position
	 * @returns "right" for the correct answer, "wrong" for a wrong pick, otherwise null
	 */
	function markFor(answerIndex: number): 'right' | 'wrong' | null {
		if (!isChecked) {
			return null;
		}
		if (question.answers[answerIndex].isCorrect) {
			return 'right';
		}
		return answerIndex === pickedIndex ? 'wrong' : null;
	}
</script>

<!-- The group listens for A–D so letters work from any answer button inside it. -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
	aria-label={`Question ${questionNumber}`}
	class="flex flex-col gap-3 rounded-medium border bg-surface px-5 py-4"
	onkeydown={handleKeydown}
	role="group"
>
	<p class="type-lesson m-0">
		<span class="type-label-mono mr-2 text-ink-faint">{questionNumber}.</span>{question.question}
	</p>
	<ul class="m-0 flex list-none flex-col gap-2 p-0">
		{#each question.answers as answer, answerIndex (answer.text)}
			<QuizOption
				letter={answerLetter(answerIndex)}
				text={answer.text}
				isPicked={pickedIndex === answerIndex}
				mark={markFor(answerIndex)}
				isLocked={isChecked}
				onpick={() => (pickedIndex = answerIndex)}
			/>
		{/each}
	</ul>

	{#if isChecked && pickedIndex !== null}
		<div class="type-small flex flex-col gap-1.5" role="status">
			<p class="m-0">
				<b>{outcome === 'correct' ? '✓ Right.' : '✗ Not quite.'}</b>
				{question.answers[pickedIndex].explanation}
			</p>
			{#if outcome !== 'correct'}
				{@const rightIndex = question.answers.findIndex((answer) => answer.isCorrect)}
				<p class="m-0 text-ink-muted">
					Right answer ({answerLetter(rightIndex)}): {question.answers[rightIndex].explanation}
				</p>
			{/if}
		</div>
	{:else}
		<div>
			<Button variant="secondary" onclick={checkAnswer} disabled={pickedIndex === null}>
				Check answer
			</Button>
		</div>
	{/if}
</section>
