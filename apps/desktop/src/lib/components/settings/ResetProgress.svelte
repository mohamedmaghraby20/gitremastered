<!--
  ResetProgress.svelte
  Settings row that forgets finished challenges and quiz results, after asking to confirm.
  The first click only asks; nothing is deleted until the student confirms.
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { resetProgress } from '$lib/stores/progress';

	let isConfirming = $state(false);
	let hasReset = $state(false);

	/** Forgets the progress and says so. */
	async function confirmReset(): Promise<void> {
		await resetProgress();
		isConfirming = false;
		hasReset = true;
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
	<div>
		<div class="font-semibold">Reset progress</div>
		<div class="type-small text-ink-muted">
			Forgets finished challenges, quiz results and where you are in each lesson. Your settings
			stay.
		</div>
	</div>
	{#if isConfirming}
		<div class="flex items-center gap-2.5" role="group" aria-label="Confirm reset">
			<span class="type-small">Forget all progress?</span>
			<Button variant="secondary" onclick={confirmReset}>Yes, reset</Button>
			<Button variant="ghost" onclick={() => (isConfirming = false)}>Cancel</Button>
		</div>
	{:else}
		<div class="flex items-center gap-2.5">
			{#if hasReset}
				<span class="type-small text-ink-muted" role="status">Progress reset.</span>
			{/if}
			<Button
				variant="secondary"
				onclick={() => {
					hasReset = false;
					isConfirming = true;
				}}
			>
				Reset progress…
			</Button>
		</div>
	{/if}
</div>
