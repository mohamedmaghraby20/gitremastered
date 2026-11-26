<!--
  PathCard.svelte
  "Your path": the Pro / Book switch and two progress bars (core lessons, whole course).
  Both paths hold the same lessons, so the counts are the same; the switch changes the order
  of "Up next" and of the course map.

  Inputs: chosenPathId, coreProgress, wholeProgress (done / total),
          onPathChange (called with the newly chosen path).
-->
<script lang="ts">
	import type { CoursePathId } from '$lib/stores/progress';
	import type { PathProgress } from '$lib/progress/learning-summary';
	import { ProgressBar } from '$lib/components/ui/progress-bar';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import HomeCard from './HomeCard.svelte';

	let {
		chosenPathId,
		coreProgress,
		wholeProgress,
		onPathChange
	}: {
		chosenPathId: CoursePathId;
		coreProgress: PathProgress;
		wholeProgress: PathProgress;
		onPathChange: (pathId: CoursePathId) => void;
	} = $props();

	const pathOptions: SegmentedSwitchOption<CoursePathId>[] = [
		{ value: 'pro-path', label: 'Pro' },
		{ value: 'book-path', label: 'Book' }
	];
</script>

<HomeCard title="Your path">
	{#snippet aside()}
		<SegmentedSwitch
			groupLabel="Path"
			options={pathOptions}
			value={chosenPathId}
			onchange={onPathChange}
		/>
	{/snippet}
	<ProgressBar
		label="Core lessons"
		doneCount={coreProgress.doneCount}
		totalCount={coreProgress.totalCount}
	/>
	<ProgressBar
		label="Whole course"
		doneCount={wholeProgress.doneCount}
		totalCount={wholeProgress.totalCount}
	/>
	<p class="type-small m-0 text-ink-muted">
		Pro path orders lessons by what you need at work. Book path follows Pro Git chapter by chapter.
	</p>
</HomeCard>
