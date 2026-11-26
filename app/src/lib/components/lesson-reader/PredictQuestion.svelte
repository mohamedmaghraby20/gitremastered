<!--
  PredictQuestion.svelte
  A ":::predict" lesson block (teaching rule 16): a question the student answers in their head
  before trying something, with the answer hidden behind a "Show answer" button. Thinking
  first makes the Try-it that follows stick.

  Inputs: question and answer, each one line of Markdown.
-->
<script lang="ts">
	import { renderInlineMarkdown } from '$lib/content/render-markdown';
	import { Button } from '$lib/components/ui/button';

	let { question, answer }: { question: string; answer: string } = $props();

	/** A unique ID for the answer, so the button can name what it opens. */
	const answerId = `predict-answer-${Math.random().toString(36).slice(2)}`;

	let isAnswerShown = $state(false);
</script>

<section
	aria-label="Think first"
	class="flex flex-col items-start gap-2 rounded-medium border border-l-2 border-l-primary px-4 py-3"
>
	<span class="type-caption text-ink-muted uppercase">Think first</span>
	<p class="lesson-lede type-body m-0">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
		{@html renderInlineMarkdown(question)}
	</p>
	<Button
		variant="secondary"
		aria-expanded={isAnswerShown}
		aria-controls={answerId}
		onclick={() => (isAnswerShown = !isAnswerShown)}
	>
		{isAnswerShown ? 'Hide answer' : 'Show answer'}
	</Button>
	<p id={answerId} class="lesson-lede type-body m-0" hidden={!isAnswerShown}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- only our own bundled lesson files reach here -->
		{@html renderInlineMarkdown(answer)}
	</p>
</section>
