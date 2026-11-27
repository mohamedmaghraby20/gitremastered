/**
 * Quiz.svelte.test.ts
 * Component tests for the quiz: picking by mouse and by A–D keys, checking with icons and
 * explanations, and the final score.
 */

import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import type { Quiz as QuizData } from '@gitremastered/course-engine/types/quiz';
import Quiz from './Quiz.svelte';

const quiz: QuizData = {
	questions: [
		{
			question: 'Where does an edit go first?',
			answers: [
				{ text: 'The working tree', isCorrect: true, explanation: 'Edits start there.' },
				{ text: 'The repository', isCorrect: false, explanation: 'Only commits go there.' }
			]
		},
		{
			question: 'What does git add do?',
			answers: [
				{ text: 'Makes a commit', isCorrect: false, explanation: 'git commit does that.' },
				{ text: 'Stages a file', isCorrect: true, explanation: 'It stages the file.' }
			]
		}
	]
};

describe('Quiz', () => {
	it('marks a right pick with a check mark and explains it', async () => {
		await render(Quiz, { quiz });
		const firstQuestion = page.getByRole('group', { name: 'Question 1' });

		await firstQuestion.getByRole('button', { name: /The working tree/ }).click();
		await firstQuestion.getByRole('button', { name: 'Check answer' }).click();

		await expect.element(firstQuestion.getByText('✓ Right', { exact: true })).toBeVisible();
		await expect.element(firstQuestion.getByText(/Edits start there/)).toBeVisible();
	});

	it('marks a wrong pick, shows the right answer and both explanations', async () => {
		await render(Quiz, { quiz });
		const firstQuestion = page.getByRole('group', { name: 'Question 1' });

		await firstQuestion.getByRole('button', { name: /The repository/ }).click();
		await firstQuestion.getByRole('button', { name: 'Check answer' }).click();

		await expect.element(firstQuestion.getByText('✗ Wrong', { exact: true })).toBeVisible();
		await expect.element(firstQuestion.getByText('✓ Right', { exact: true })).toBeVisible();
		await expect.element(firstQuestion.getByText(/Only commits go there/)).toBeVisible();
		await expect.element(firstQuestion.getByText(/Right answer \(A\)/)).toBeVisible();
	});

	it('picks answers with the A–D keys', async () => {
		await render(Quiz, { quiz });
		const secondQuestion = page.getByRole('group', { name: 'Question 2' });
		const firstAnswer = secondQuestion.getByRole('button', { name: /Makes a commit/ });
		const secondAnswer = secondQuestion.getByRole('button', { name: /Stages a file/ });

		await firstAnswer.click();
		await userEvent.keyboard('b');

		await expect.element(secondAnswer).toHaveAttribute('aria-pressed', 'true');
		await expect.element(firstAnswer).toHaveAttribute('aria-pressed', 'false');
	});

	it('shows the score and reports it once every question is checked', async () => {
		const onfinish = vi.fn();
		await render(Quiz, { quiz, onfinish });

		for (const [questionName, answerName] of [
			['Question 1', /The working tree/],
			['Question 2', /Makes a commit/]
		] as const) {
			const question = page.getByRole('group', { name: questionName });
			await question.getByRole('button', { name: answerName }).click();
			await question.getByRole('button', { name: 'Check answer' }).click();
		}

		await expect.element(page.getByText('1 / 2 right')).toBeVisible();
		expect(onfinish).toHaveBeenCalledWith(expect.objectContaining({ correctCount: 1 }));
	});
});
