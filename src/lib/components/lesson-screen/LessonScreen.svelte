<!--
  LessonScreen.svelte
  One open lesson: the lesson column (text, mission, quiz) on the left and the practice column
  (visualizer and terminal) on the right.
  It owns the lesson's practice session and listens for live repo snapshots while open.
  The page re-creates it for each lesson, so every lesson starts with a fresh session.

  Inputs: lesson (the loaded lesson), place (its number and neighbours in the path, or null).
-->
<script lang="ts">
	import type { Lesson } from '@gitremastered/course-engine/types/lesson';
	import type { LessonPlace } from '@gitremastered/course-engine/content/lesson-navigation';
	import { untrack } from 'svelte';
	import { PracticeSession } from '$lib/mission-engine/practice-session.svelte';
	import { GitHubWatch } from '$lib/mission-engine/github-watch.svelte';
	import {
		findGitHubChallengeStart,
		getGitHubState,
		grantGitHubConsent
	} from '$lib/tauri/commands';
	import { sharedRepoName } from '@gitremastered/course-engine/types/github';
	import {
		clearRepoSnapshot,
		currentRepoSnapshot,
		startRepoSnapshotUpdates
	} from '$lib/stores/repo-snapshot';
	import LessonReader from '$lib/components/lesson-reader/LessonReader.svelte';
	import ChallengesSection from '$lib/components/challenges/ChallengesSection.svelte';
	import Quiz from '$lib/components/quiz/Quiz.svelte';
	import type { QuizScore } from '$lib/quiz/score-quiz';
	import type { LessonLayerId } from '@gitremastered/course-engine/types/lesson';
	import {
		markChallengeFinished,
		saveActiveChallenge,
		saveLayerRead,
		saveLessonOpened,
		progress,
		savePanelSizes,
		saveQuizResult
	} from '$lib/stores/progress';
	import PracticeColumn from './PracticeColumn.svelte';
	import { ResizeHandle } from '$lib/components/ui/resize-handle';
	import { lessonColumnLimits } from '$lib/layout/panel-sizes';

	let { lesson, place }: { lesson: Lesson; place: LessonPlace | null } = $props();

	/** The challenge the practice project is set up for: the saved one, or the first (easy). */
	const activeChallenge = $derived(
		lesson.challenges.find(
			(challenge) => challenge.id === $progress.activeChallengeIds[lesson.id]
		) ?? lesson.challenges[0]
	);

	// Created once per lesson: the page wraps this component in {#key lesson.id}.
	// svelte-ignore state_referenced_locally
	const session = new PracticeSession(lesson.id, activeChallenge.setup, activeChallenge.github);

	/** The active GitHub challenge's view of its repository on GitHub; null for a local one. */
	let gitHubWatch: GitHubWatch | null = $state(null);

	/** When Rust saved no start, every pull request and issue counts (the start of time). */
	const unknownStart = new Date(0).toISOString();

	// A GitHub challenge reads its repository once its folder is built, until it closes. The
	// attempt's start comes from Rust, which saved it by GitHub's clock right after the reset.
	$effect(() => {
		const github = activeChallenge.github;
		const isBuilt = session.practiceFolderPath !== null;
		if (github === null || !isBuilt) {
			return;
		}
		let watch: GitHubWatch | null = null;
		let isClosed = false;
		void findGitHubChallengeStart(lesson.id).then((savedStart) => {
			if (isClosed) {
				return;
			}
			watch = new GitHubWatch(sharedRepoName(github), savedStart ?? unknownStart, getGitHubState);
			gitHubWatch = watch;
			void watch.readNow();
		});
		return () => {
			isClosed = true;
			watch?.stop();
			gitHubWatch = null;
		};
	});

	// A local change (a push, say) may have changed GitHub too: read it again soon. Only the
	// snapshot starts this effect; a new reader alone must not add an extra read.
	$effect(() => {
		if ($currentRepoSnapshot !== null) {
			untrack(() => gitHubWatch?.noticeLocalChange());
		}
	});

	/** Asks for consent in the app's own dialog and, on a yes, builds the GitHub challenge. */
	async function acceptGitHubConsent(): Promise<void> {
		const hasAgreed = await grantGitHubConsent();
		if (hasAgreed) {
			await session.buildAfterConsent();
		}
	}

	/**
	 * Starts a challenge: remembers it and rebuilds the practice project in its starting state.
	 * @param challengeId - the challenge the student picked
	 */
	function startChallenge(challengeId: string): void {
		const challenge = lesson.challenges.find((candidate) => candidate.id === challengeId);
		if (challenge === undefined) {
			return;
		}
		void saveActiveChallenge(lesson.id, challengeId);
		void session.startChallenge(challenge.setup, challenge.github);
	}

	/**
	 * Remembers a finished challenge (the lesson then counts as done).
	 * @param challengeId - the challenge whose goals are all met
	 */
	function finishChallenge(challengeId: string): void {
		void markChallengeFinished(lesson.id, challengeId);
	}

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

	/**
	 * Saves that the student opened a reading layer of this lesson.
	 * @param layerId - the layer on screen
	 */
	function rememberLayer(layerId: LessonLayerId): void {
		void saveLayerRead(lesson.id, layerId);
	}

	/** The lesson column's share while dragging; it starts from the saved share. */
	let draggedColumnShare: number | null | undefined = $state(undefined);
	const lessonColumnShare = $derived(
		draggedColumnShare === undefined ? $progress.lessonColumnShare : draggedColumnShare
	);

	/**
	 * Shows the lesson column at a new share while the handle moves.
	 * @param share - the lesson column's share in percent
	 */
	function showLessonColumnShare(share: number): void {
		draggedColumnShare = share;
	}

	/**
	 * Saves the share once the drag or key press is done.
	 * @param share - the lesson column's share in percent
	 */
	function saveLessonColumnShare(share: number): void {
		draggedColumnShare = undefined;
		void savePanelSizes({ lessonColumnShare: share });
	}

	/** Goes back to the design's default column widths (double-click on the handle). */
	function resetLessonColumnShare(): void {
		draggedColumnShare = undefined;
		void savePanelSizes({ lessonColumnShare: null });
	}

	// Opening the lesson makes it the one "Pick up where you left off" continues.
	$effect(() => {
		void saveLessonOpened(lesson.id);
		rememberLayer('mustKnow');
	});

	$effect(() => {
		clearRepoSnapshot();
		const stopFollowing = followSnapshots();
		void session.start();
		return stopFollowing;
	});
</script>

<!-- Fills the page area (all of <main>, under the top bar), so each column scrolls on its own.
     Each column is h-full: in a wrapping flex row a column would otherwise grow to its whole
     content height and push the terminal out of sight. The handle between the columns resizes
     them; below 1100px (narrow:) the practice column shows one tool at a time. -->
<div class="flex h-full overflow-y-auto">
	<LessonReader {lesson} {place} onLayerChange={rememberLayer} widthShare={lessonColumnShare}>
		{#snippet afterText()}
			<ChallengesSection
				challenges={lesson.challenges}
				activeChallengeId={activeChallenge.id}
				finishedChallengeIds={$progress.finishedChallenges[lesson.id] ?? []}
				snapshot={$currentRepoSnapshot}
				onstart={startChallenge}
				onreset={() => session.reset()}
				oncomplete={finishChallenge}
				{gitHubWatch}
				needsGitHubConsent={session.needsGitHubConsent}
				onGitHubConsent={acceptGitHubConsent}
			/>
			<Quiz quiz={lesson.quiz} onfinish={saveQuizScore} />
		{/snippet}
	</LessonReader>
	<ResizeHandle
		direction="columns"
		label="Resize the lesson and practice columns"
		limits={lessonColumnLimits}
		onresize={showLessonColumnShare}
		onresizeend={saveLessonColumnShare}
		onreset={resetLessonColumnShare}
	/>
	<PracticeColumn missionId={lesson.id} {session} snapshot={$currentRepoSnapshot} />
</div>
