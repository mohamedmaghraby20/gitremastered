<!--
  GoalRow.svelte
  One line of the mission checklist: a box that ticks itself when the goal is met.
  Status is shown with a ✓ and words for screen readers, never by color alone.
  Inputs: label (the goal in words), isMet.
-->
<script lang="ts">
	let { label, isMet }: { label: string; isMet: boolean } = $props();
</script>

<li class={['flex items-center gap-2.5', !isMet && 'text-ink-muted']}>
	<span
		aria-hidden="true"
		class={[
			'type-label-mono grid size-4.5 shrink-0 place-items-center rounded-small border-[1.5px]',
			isMet ? 'border-success font-bold text-success' : 'border-border-strong'
		]}
	>
		{isMet ? '✓' : ''}
	</span>
	<span>{label}</span>
	<span class="sr-only">{isMet ? '(done)' : '(not done yet)'}</span>
</li>
