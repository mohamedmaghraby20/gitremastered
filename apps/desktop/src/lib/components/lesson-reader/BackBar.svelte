<!--
  BackBar.svelte
  The bar at the top of a lesson the student reached through a link in another lesson:
  "← Back to <that lesson>" returns to the same layer and scroll position; × hides the bar.

  Inputs: fromTitle (the lesson the link was in), onback (go back), ondismiss (hide the bar).
-->
<script lang="ts">
	let {
		fromTitle,
		onback,
		ondismiss
	}: { fromTitle: string; onback: () => void; ondismiss: () => void } = $props();
</script>

<div
	role="navigation"
	aria-label="Back to the lesson you came from"
	class="flex items-center justify-between gap-3 rounded-medium border bg-git-staging-wash px-3 py-2"
>
	<button
		type="button"
		onclick={onback}
		class="type-small cursor-pointer text-left text-ink hover:underline"
	>
		← Back to <span class="font-semibold">{fromTitle}</span>
	</button>
	<button
		type="button"
		onclick={ondismiss}
		aria-label="Hide the way back"
		class="type-small cursor-pointer px-1 text-ink-muted hover:text-ink"
	>
		×
	</button>
</div>
