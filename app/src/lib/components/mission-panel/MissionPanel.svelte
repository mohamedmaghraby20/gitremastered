<!--
  MissionPanel.svelte
  The mission as a worksheet ticket (DESIGN.md): header with the mission number and progress,
  a dashed separator, the brief in serif, a checklist that ticks itself from the live snapshot,
  and the actions: Check mission, Reset practice, and the hint ladder.

  Inputs:  mission (from mission.yaml), missionNumber (e.g. "05", or null), snapshot (live repo
           state or null), onReset (rebuilds the practice folder), onComplete (called once when
           every goal is met).
-->
<script lang="ts">
	import type { Mission } from '$lib/types/mission';
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { Button } from '$lib/components/ui/button';
	import { checkGoals } from '$lib/mission-engine/goal-checker';
	import {
		createHintLadder,
		describeCheckResult,
		hasHiddenHints,
		hintButtonLabel,
		revealNextHint
	} from '$lib/mission-engine/mission-session';
	import GoalRow from './GoalRow.svelte';

	let {
		mission,
		missionNumber,
		snapshot,
		onReset,
		onComplete = () => {}
	}: {
		mission: Mission;
		missionNumber: string | null;
		snapshot: RepoSnapshot | null;
		onReset: () => Promise<void>;
		onComplete?: () => void;
	} = $props();

	// svelte-ignore state_referenced_locally
	let hintLadder = $state(createHintLadder(mission.hints.length));
	let checkMessage: string | null = $state(null);
	let isResetting = $state(false);
	let hasReportedCompletion = false;

	const goalResults = $derived(checkGoals(mission.goals, snapshot));
	const metCount = $derived(goalResults.filter((isMet) => isMet).length);
	const isComplete = $derived(metCount === mission.goals.length);

	$effect(() => {
		if (isComplete && !hasReportedCompletion) {
			hasReportedCompletion = true;
			onComplete();
		}
	});

	/** Shows the result of checking every goal right now. */
	function checkMission(): void {
		checkMessage = describeCheckResult(goalResults);
	}

	/** Rebuilds the practice folder and starts the mission over (hints hidden again). */
	async function resetPractice(): Promise<void> {
		isResetting = true;
		checkMessage = null;
		hintLadder = createHintLadder(mission.hints.length);
		await onReset();
		isResetting = false;
	}
</script>

<section aria-label="Mission" class="rounded-medium border bg-surface">
	<header
		class="flex items-center justify-between border-b border-dashed border-b-border-strong px-5 py-2.5"
	>
		<span class="type-caption text-ink-muted uppercase">
			Mission
			{#if missionNumber !== null}
				<b class="type-label-mono font-bold text-ink">{missionNumber}</b>
			{/if}
		</span>
		<span class="type-label-mono text-ink-muted">{metCount} / {mission.goals.length} done</span>
	</header>

	<div class="flex flex-col gap-3.5 px-5 pt-4 pb-5">
		<p
			class="m-0 font-serif text-[length:var(--type-lede-size)] leading-[var(--type-lesson-line-height)]"
		>
			{mission.brief}
		</p>

		<ul class="type-body m-0 flex list-none flex-col gap-2 p-0" aria-label="Goals">
			{#each mission.goals as goal, index (goal.label)}
				<GoalRow label={goal.label} isMet={goalResults[index]} />
			{/each}
		</ul>

		{#if hintLadder.revealedCount > 0}
			<ol class="type-small m-0 flex flex-col gap-1.5 pl-5 text-ink-muted" aria-label="Hints">
				{#each mission.hints.slice(0, hintLadder.revealedCount) as hint (hint)}
					<li>{hint}</li>
				{/each}
			</ol>
		{/if}

		{#if checkMessage !== null}
			<p class={['type-small m-0', isComplete ? 'text-success' : 'text-ink']} role="status">
				{isComplete ? '✓ ' : ''}{checkMessage}
			</p>
		{/if}

		<div class="flex flex-wrap gap-2.5">
			<Button onclick={checkMission}>Check mission</Button>
			<Button variant="secondary" onclick={resetPractice} disabled={isResetting}>
				{isResetting ? 'Resetting…' : 'Reset practice'}
			</Button>
			<Button
				variant="ghost"
				onclick={() => (hintLadder = revealNextHint(hintLadder))}
				disabled={!hasHiddenHints(hintLadder)}
			>
				{hintButtonLabel(hintLadder)}
			</Button>
		</div>
	</div>
</section>
