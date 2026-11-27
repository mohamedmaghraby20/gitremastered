<!--
  ChallengeCard.svelte
  One challenge in the lesson's list: its number and level, title and brief, whether it is done,
  and either "Working on it" (the challenge the practice project is set up for) or a
  "Start this challenge" button. Status is shown in words, never by color alone.

  Inputs: challenge, number (1-based), isActive (the practice project is set up for it),
          isDone (finished before), onstart (called when the student starts it).
-->
<script lang="ts">
	import type { Challenge } from '@gitremastered/course-engine/types/mission';
	import { Button } from '$lib/components/ui/button';

	let {
		challenge,
		number,
		isActive,
		isDone,
		onstart
	}: {
		challenge: Challenge;
		number: number;
		isActive: boolean;
		isDone: boolean;
		onstart: () => void;
	} = $props();

	/** The level as shown, e.g. "Easy". */
	const levelLabel = $derived(challenge.level.charAt(0).toUpperCase() + challenge.level.slice(1));
</script>

<li
	class={[
		'flex flex-col gap-2 rounded-medium border px-4 py-3.5',
		isActive ? 'bg-git-staging-wash shadow-[inset_3px_0_0_var(--primary)]' : 'bg-surface'
	]}
>
	<div class="type-caption flex flex-wrap items-center gap-2 text-ink-muted uppercase">
		<span class="type-label-mono rounded-small border border-border-strong px-1.5 text-ink">
			{number}
		</span>
		{levelLabel}
		{#if isDone}
			<span class="font-semibold text-success normal-case">✓ Done</span>
		{/if}
	</div>
	<h3 class="type-body m-0 font-semibold">{challenge.title}</h3>
	<p class="type-small m-0 text-ink-muted">{challenge.brief}</p>
	<div>
		{#if isActive}
			<span class="type-small font-semibold text-ink">● Working on it: the goals are below.</span>
		{:else}
			<Button variant="secondary" onclick={onstart}>
				{isDone ? 'Do it again' : 'Start this challenge'}
			</Button>
		{/if}
	</div>
</li>
