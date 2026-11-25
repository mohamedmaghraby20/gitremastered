<!--
  LessonScreen.svelte
  One open lesson: the lesson column on the left and the practice column on the right.
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
	import LessonReader from '$lib/components/lesson-reader/LessonReader.svelte';
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

	$effect(() => {
		clearRepoSnapshot();
		const stopFollowing = followSnapshots();
		void session.start();
		return stopFollowing;
	});
</script>

<!-- Fills the window under the 48px top bar (h-12), so each column scrolls on its own. -->
<div class="flex h-[calc(100dvh-(--spacing(12)))] flex-wrap">
	<LessonReader {lesson} {place} />
	<PracticeColumn missionId={lesson.id} {session} snapshot={$currentRepoSnapshot} />
</div>
