<!--
  RefLabels.svelte
  The labels pinned above a commit, on the history map and in lesson diagrams:
  - the yellow "HEAD · you" pin when HEAD is here ("HEAD · detached" when it points straight
    at the commit and not through a branch),
  - a filled "branch <name>" tag for each local branch,
  - an outlined "remote <name>" tag for each remote-tracking branch (like origin/main),
  - a dashed "tag <name>" tag for each tag.
  Each kind has its own word and shape, so color is never the only difference.

  Inputs: isHead, isHeadDetached, branchNames, remoteBranchNames, tagNames.
-->
<script lang="ts">
	let {
		isHead,
		isHeadDetached = false,
		branchNames,
		remoteBranchNames = [],
		tagNames = []
	}: {
		isHead: boolean;
		isHeadDetached?: boolean;
		branchNames: string[];
		remoteBranchNames?: string[];
		tagNames?: string[];
	} = $props();
</script>

{#if isHead}
	<span
		class="type-label-mono rounded-small border border-git-staging-edge bg-highlight px-1.5 font-bold text-on-highlight"
		title={isHeadDetached ? 'HEAD points straight at this commit, not at a branch' : undefined}
	>
		{isHeadDetached ? 'HEAD · detached' : 'HEAD · you'}
	</span>
{/if}
{#each branchNames as branchName (branchName)}
	<span
		class="type-label-mono flex gap-1 rounded-small bg-git-branch px-1.5 text-on-git-repository"
		title={`Branch ${branchName}`}
	>
		<span class="opacity-75">branch</span>
		<span class="font-bold">{branchName}</span>
	</span>
{/each}
{#each remoteBranchNames as remoteBranchName (remoteBranchName)}
	<span
		class="type-label-mono flex gap-1 rounded-small border border-git-remote bg-surface px-1.5 text-ink"
		title={`Remote-tracking branch ${remoteBranchName}`}
	>
		<span class="opacity-75">remote</span>
		<span class="font-bold">{remoteBranchName}</span>
	</span>
{/each}
{#each tagNames as tagName (tagName)}
	<span
		class="type-label-mono flex gap-1 rounded-small border border-dashed border-border-strong bg-surface px-1.5 text-ink"
		title={`Tag ${tagName}`}
	>
		<span class="opacity-75">tag</span>
		<span class="font-bold">{tagName}</span>
	</span>
{/each}
