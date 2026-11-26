<!--
  WorkStatus.svelte
  The strip between the board's header and the files desk, shown only when there is something
  to say:
  - a banner while a merge, rebase, revert or cherry-pick waits to be finished, with the
    next step (marked by the word and a warning rule, never by color alone);
  - the "Stash" shelf: work put away with git stash, newest first.

  Input: snapshot (the repo state, or null while it loads).
-->
<script lang="ts">
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import { describeOperation } from '$lib/visualizer/work-state';

	let { snapshot }: { snapshot: RepoSnapshot | null } = $props();

	/** How many stash entries the shelf lists; older ones are only counted. */
	const visibleStashCount = 2;

	const banner = $derived(snapshot === null ? null : describeOperation(snapshot));
	const stashes = $derived(snapshot?.stashes ?? []);
	const hiddenStashCount = $derived(Math.max(0, stashes.length - visibleStashCount));
</script>

{#if banner !== null}
	<div
		role="status"
		class="mx-3.5 mt-1 flex flex-col rounded-medium border border-l-2 border-l-warning bg-surface px-2.5 py-1.5"
		data-testid="operation-banner"
	>
		<span class="type-caption text-warning uppercase">{banner.title}</span>
		<span class="type-small text-ink-muted">{banner.nextStep}</span>
	</div>
{/if}
{#if stashes.length > 0}
	<section
		aria-label="Stash"
		class="mx-3.5 mt-1 flex items-center gap-2 rounded-medium border border-dashed bg-surface px-2.5 py-1"
		data-testid="stash-shelf"
	>
		<h3 class="type-caption m-0 shrink-0 text-ink-muted uppercase">
			Stash · {stashes.length}
		</h3>
		<ul class="m-0 flex min-w-0 list-none flex-wrap gap-1 p-0">
			{#each stashes.slice(0, visibleStashCount) as stashMessage, index (index)}
				<li class="type-label-mono max-w-60 truncate rounded-small border px-1.5">
					{stashMessage}
				</li>
			{/each}
			{#if hiddenStashCount > 0}
				<li class="type-caption text-ink-muted">+{hiddenStashCount} more</li>
			{/if}
		</ul>
	</section>
{/if}
