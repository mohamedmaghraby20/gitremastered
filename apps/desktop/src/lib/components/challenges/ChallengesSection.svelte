<!--
  ChallengesSection.svelte
  The lesson's "Challenges" part, before the quiz: three or more real jobs from easy to hard.
  The student picks any one; starting it rebuilds the practice project in that challenge's
  starting state. The active challenge's goals tick below the list as the repository changes.

  Inputs: challenges (the lesson's, easy to hard), activeChallengeId, finishedChallengeIds,
          snapshot (live repo state or null), onstart (start a challenge by ID),
          onreset (rebuild the practice folder), oncomplete (the active challenge is done),
          gitHubWatch (a GitHub challenge's view of GitHub, or null), needsGitHubConsent,
          onGitHubConsent (the student accepted the consent screen).
-->
<script lang="ts">
	import type { Challenge } from '@gitremastered/course-engine/types/challenge';
	import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
	import type { GitHubWatch } from '$lib/practice/github-watch.svelte';
	import PartHeading from '$lib/components/lesson-reader/PartHeading.svelte';
	import ChallengePanel from '$lib/components/challenges/ChallengePanel.svelte';
	import ChallengeCard from './ChallengeCard.svelte';

	let {
		challenges,
		activeChallengeId,
		finishedChallengeIds,
		snapshot,
		onstart,
		onreset,
		oncomplete,
		gitHubWatch = null,
		needsGitHubConsent = false,
		onGitHubConsent = async () => {}
	}: {
		challenges: Challenge[];
		activeChallengeId: string;
		finishedChallengeIds: string[];
		snapshot: RepoSnapshot | null;
		onstart: (challengeId: string) => void;
		onreset: () => Promise<void>;
		oncomplete: (challengeId: string) => void;
		gitHubWatch?: GitHubWatch | null;
		needsGitHubConsent?: boolean;
		onGitHubConsent?: () => Promise<void>;
	} = $props();

	const activeIndex = $derived(
		Math.max(
			0,
			challenges.findIndex((challenge) => challenge.id === activeChallengeId)
		)
	);
	const activeChallenge = $derived(challenges[activeIndex]);

	/**
	 * Builds the active panel's heading, e.g. "Challenge 2 · Medium".
	 * @returns the heading text
	 */
	function describeActiveChallenge(): string {
		const level = activeChallenge.level;
		return `Challenge ${activeIndex + 1} · ${level.charAt(0).toUpperCase()}${level.slice(1)}`;
	}

	/** Reports the active challenge as done. */
	function completeActiveChallenge(): void {
		oncomplete(activeChallenge.id);
	}
</script>

<section aria-labelledby="challenges-heading" class="flex flex-col gap-3">
	<PartHeading
		headingId="challenges-heading"
		title="Challenges"
		description="Real jobs to do in the terminal, from easy to hard. Pick any one: starting it sets up the practice project for it."
	/>
	<ul class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3 p-0">
		{#each challenges as challenge, index (challenge.id)}
			<ChallengeCard
				{challenge}
				number={index + 1}
				isActive={index === activeIndex}
				isDone={finishedChallengeIds.includes(challenge.id)}
				onstart={() => onstart(challenge.id)}
			/>
		{/each}
	</ul>
	{#key activeChallenge.id}
		<ChallengePanel
			challenge={activeChallenge}
			heading={describeActiveChallenge()}
			{snapshot}
			onReset={onreset}
			onComplete={completeActiveChallenge}
			{gitHubWatch}
			{needsGitHubConsent}
			{onGitHubConsent}
		/>
	{/key}
</section>
