<!--
  progress-bar.svelte
  A thin progress bar with its label and "done / total" count above it, as on the home
  screen's path card and in the sidebar. Screen readers get a real progressbar with the count.

  Inputs: label (e.g. "Core lessons"), doneCount, totalCount.
-->
<script lang="ts">
	let { label, doneCount, totalCount }: { label: string; doneCount: number; totalCount: number } =
		$props();

	/** The filled share in percent; 0 when there is nothing to count. */
	const percentDone = $derived(totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100));
</script>

<div class="flex flex-col gap-1.5">
	<div class="type-small flex justify-between gap-2">
		<span>{label}</span>
		<span class="type-label-mono text-ink-muted">{doneCount} / {totalCount}</span>
	</div>
	<div
		role="progressbar"
		aria-label={label}
		aria-valuemin={0}
		aria-valuemax={totalCount}
		aria-valuenow={doneCount}
		aria-valuetext={`${doneCount} of ${totalCount} done`}
		class="h-1 bg-border"
	>
		<div class="h-full bg-primary" style:width={`${percentDone}%`}></div>
	</div>
</div>
