<!--
  PracticeRepositoriesDelete.svelte
  Settings row: lists the practice repositories on the student's GitHub account and deletes
  them after a confirm step. Deleting needs GitHub's delete_repo permission; without it the
  row shows the one command that adds it.
  Input: canDeleteRepos (true when `gh` has the delete_repo permission).
-->
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { deletePracticeRepositories, listPracticeRepositories } from '$lib/tauri/commands';

	let { canDeleteRepos }: { canDeleteRepos: boolean } = $props();

	let repositoryNames: string[] | null = $state(null);
	let isConfirming = $state(false);
	let message: string | null = $state(null);

	/** Asks GitHub which practice repositories exist and shows them. */
	async function showRepositories(): Promise<void> {
		message = null;
		isConfirming = false;
		try {
			repositoryNames = await listPracticeRepositories();
		} catch (error) {
			message = `Could not list the repositories: ${String(error)}`;
		}
	}

	/**
	 * Deletes the listed practice repositories. The app asks once more in its own dialog,
	 * which names them; saying no there deletes nothing.
	 */
	async function confirmDelete(): Promise<void> {
		isConfirming = false;
		const listedNames = repositoryNames ?? [];
		try {
			const deletedNames = await deletePracticeRepositories(listedNames);
			if (deletedNames.length === 0) {
				message = 'Nothing was deleted.';
				return;
			}
			message = `Deleted: ${deletedNames.join(', ')}.`;
			repositoryNames = listedNames.filter((name) => !deletedNames.includes(name));
		} catch (error) {
			message = `Could not delete: ${String(error)}`;
		}
	}
</script>

<div class="flex flex-col gap-3 border-t px-5 py-4">
	<div>
		<div class="font-semibold">Delete my practice repositories</div>
		<div class="type-small text-ink-muted">
			Removes every <code class="type-code">gitremastered-practice…</code> repository from your GitHub
			account. No other repository is touched.
		</div>
	</div>

	{#if !canDeleteRepos}
		<p class="type-small m-0">
			GitHub needs one more permission for deleting. Run
			<code class="type-code rounded-small bg-surface-sunken px-1.5 py-0.5 select-all">
				gh auth refresh -h github.com -s delete_repo
			</code>, then Check again.
		</p>
	{:else}
		<div>
			<Button variant="secondary" onclick={showRepositories}>Show my practice repositories</Button>
		</div>
		{#if repositoryNames !== null && repositoryNames.length > 0}
			<ul class="type-code m-0 pl-5">
				{#each repositoryNames as repositoryName (repositoryName)}
					<li>{repositoryName}</li>
				{/each}
			</ul>
			{#if isConfirming}
				<div class="flex flex-wrap items-center gap-2.5" role="group" aria-label="Confirm delete">
					<span class="type-small">
						Delete these {repositoryNames.length} repositories from GitHub? This cannot be undone.
					</span>
					<Button variant="secondary" onclick={confirmDelete}>Yes, delete them</Button>
					<Button variant="ghost" onclick={() => (isConfirming = false)}>Cancel</Button>
				</div>
			{:else}
				<div>
					<Button variant="secondary" onclick={() => (isConfirming = true)}>
						Delete these repositories…
					</Button>
				</div>
			{/if}
		{:else if repositoryNames !== null}
			<p class="type-small m-0 text-ink-muted">You have no practice repositories.</p>
		{/if}
	{/if}
	<div role="status" aria-live="polite">
		{#if message !== null}
			<p class="type-small m-0">{message}</p>
		{/if}
	</div>
</div>
