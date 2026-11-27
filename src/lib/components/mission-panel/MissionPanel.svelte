<!--
  MissionPanel.svelte
  The active challenge as a worksheet ticket (DESIGN.md): header with the challenge's name and
  progress, a dashed separator, the brief in serif, a checklist that ticks itself from the live
  snapshot, and the actions: Check challenge, Reset practice, and the hint ladder.
  A checkpoint's challenge has no hints: the hint button gives way to a line that says so.

  Inputs:  mission (the challenge's mission fields), heading (e.g. "Challenge 2 · Medium"),
           snapshot (live repo state or null), onReset (rebuilds the practice folder),
           onComplete (called once when every goal is met), and for a GitHub challenge:
           gitHubWatch (its view of GitHub, or null), needsGitHubConsent, onGitHubConsent.
  A GitHub challenge also shows the GitHub panel: consent, connection, "Check GitHub now".
-->
<script lang="ts">
	import { isGitHubGoalCheck, type Mission } from '@gitremastered/course-engine/types/mission';
	import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
	import { Button } from '$lib/components/ui/button';
	import { checkGoals } from '@gitremastered/course-engine/mission-engine/goal-checker';
	import {
		createHintLadder,
		describeCheckResult,
		hasHiddenHints,
		hintButtonLabel,
		revealNextHint
	} from '@gitremastered/course-engine/mission-engine/mission-session';
	import GoalRow from './GoalRow.svelte';
	import GitHubChallengePanel from './GitHubChallengePanel.svelte';
	import type { GitHubWatch } from '$lib/mission-engine/github-watch.svelte';

	let {
		mission,
		heading,
		snapshot,
		onReset,
		onComplete = () => {},
		gitHubWatch = null,
		needsGitHubConsent = false,
		onGitHubConsent = async () => {}
	}: {
		mission: Mission;
		heading: string;
		snapshot: RepoSnapshot | null;
		onReset: () => Promise<void>;
		onComplete?: () => void;
		gitHubWatch?: GitHubWatch | null;
		needsGitHubConsent?: boolean;
		onGitHubConsent?: () => Promise<void>;
	} = $props();

	// svelte-ignore state_referenced_locally
	let hintLadder = $state(createHintLadder(mission.hints.length));
	let checkMessage: string | null = $state(null);
	let isResetting = $state(false);
	let hasReportedCompletion = false;

	const goalResults = $derived(checkGoals(mission.goals, snapshot, gitHubWatch?.context ?? null));
	/** True while a goal that reads GitHub is not met yet: GitHub is then read every 20 s. */
	const hasOpenGitHubGoal = $derived(
		mission.goals.some((goal, index) => isGitHubGoalCheck(goal) && !goalResults[index])
	);

	$effect(() => {
		gitHubWatch?.keepReadingWhile(hasOpenGitHubGoal);
	});
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

	/** Rebuilds the practice folder and starts the challenge over (hints hidden again). */
	async function resetPractice(): Promise<void> {
		isResetting = true;
		checkMessage = null;
		hintLadder = createHintLadder(mission.hints.length);
		await onReset();
		isResetting = false;
	}
</script>

<section aria-label="Active challenge" class="rounded-medium border bg-surface">
	<header
		class="flex items-center justify-between border-b border-dashed border-b-border-strong px-5 py-2.5"
	>
		<span class="type-caption text-ink-muted uppercase">{heading}</span>
		<span class="type-label-mono text-ink-muted">{metCount} / {mission.goals.length} done</span>
	</header>

	<div class="flex flex-col gap-3.5 px-5 pt-4 pb-5">
		{#if mission.github !== null}
			<GitHubChallengePanel
				repoName={mission.github.repo}
				watch={gitHubWatch}
				needsConsent={needsGitHubConsent}
				onConsent={onGitHubConsent}
			/>
		{/if}
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
			<Button onclick={checkMission}>Check challenge</Button>
			<Button variant="secondary" onclick={resetPractice} disabled={isResetting}>
				{isResetting ? 'Resetting…' : 'Reset practice'}
			</Button>
			{#if mission.hints.length > 0}
				<Button
					variant="ghost"
					onclick={() => (hintLadder = revealNextHint(hintLadder))}
					disabled={!hasHiddenHints(hintLadder)}
				>
					{hintButtonLabel(hintLadder)}
				</Button>
			{/if}
		</div>
		{#if mission.hints.length === 0}
			<p class="type-small m-0 text-ink-muted">
				A checkpoint has no hints. Stuck? The module's lessons are in the sidebar.
			</p>
		{/if}
	</div>
</section>
