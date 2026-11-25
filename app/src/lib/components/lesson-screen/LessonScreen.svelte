<!--
  LessonScreen.svelte
  One open lesson: the lesson column (text, mission, quiz) on the left and the practice column
  (visualizer and terminal) on the right.
  It owns the lesson's practice session and listens for live repo snapshots while open.
  The page re-creates it for each lesson, so every lesson starts with a fresh session.

  Inputs: lesson (the loaded lesson), place (its number and neighbours in the path, or null).
-->
<script lang="ts">
	import type { Lesson } from '$lib/types/lesson';
	import type { LessonPlace } from '$lib/content/lesson-navigation';
	import { PracticeSession } from '$lib/mission-engine/practice-session.svelte';
	import {
		clearRepoSnapshot,
		currentRepoSnapshot,
		startRepoSnapshotUpdates
	} from '$lib/stores/repo-snapshot';
	import { formatLessonNumber } from '$lib/content/lesson-navigation';
	import LessonReader from '$lib/components/lesson-reader/LessonReader.svelte';
	import MissionPanel from '$lib/components/mission-panel/MissionPanel.svelte';
	import Quiz from '$lib/components/quiz/Quiz.svelte';
	import type { QuizScore } from '$lib/quiz/score-quiz';
	import { markMissionFinished, saveQuizResult } from '$lib/stores/progress';
	import PracticeColumn from './PracticeColumn.svelte';

	let { lesson, place }: { lesson: Lesson; place: LessonPlace | null } = $props();

	// Created once per lesson: the page wraps this component in {#key lesson.id}.
	// svelte-ignore state_referenced_locally
	const session = new PracticeSession(lesson.id, lesson.mission.setup);

	/**
	 * Starts copying live snapshots into the store, if the app runs in the desktop window.
	 * @returns a function that stops the updates (safe to call before they started)
	 */
	function followSnapshots(): () => void {
		let stopUpdates: (() => void) | null = null;
		let isStopped = false;
		if (session.isDesktopApp()) {
			void startRepoSnapshotUpdates().then((stop) => {
				if (isStopped) {
					stop();
				} else {
					stopUpdates = stop;
				}
			});
		}
		return () => {
			isStopped = true;
			stopUpdates?.();
		};
	}

	/**
	 * Saves a finished quiz's score for this lesson.
	 * @param score - the quiz result
	 */
	function saveQuizScore(score: QuizScore): void {
		void saveQuizResult(lesson.id, {
			correctCount: score.correctCount,
			questionCount: score.questionCount
		});
	}

	$effect(() => {
		clearRepoSnapshot();
		const stopFollowing = followSnapshots();
		void session.start();
		return stopFollowing;
	});
</script>

<!-- Fills the window under the 48px top bar (h-12), so each column scrolls on its own. -->
<div class="flex h-[calc(100dvh-(--spacing(12)))] flex-wrap">
	<LessonReader {lesson} {place}>
		{#snippet afterText()}
			<MissionPanel
				mission={lesson.mission}
				missionNumber={place === null ? null : formatLessonNumber(place.lessonNumber)}
				snapshot={$currentRepoSnapshot}
				onReset={() => session.reset()}
				onComplete={() => void markMissionFinished(lesson.id)}
			/>
			<Quiz quiz={lesson.quiz} onfinish={saveQuizScore} />
		{/snippet}
	</LessonReader>
	<PracticeColumn missionId={lesson.id} {session} snapshot={$currentRepoSnapshot} />
</div>
