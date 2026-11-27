<!--
  PracticeRepositoriesDelete.svelte
  Settings row: lists the practice repositories on the student's GitHub account and deletes
  them after a confirm step. Deleting needs GitHub's delete_repo permission; without it the
  row shows the one command that adds it.
  Input: canDeleteRepos (true when `gh` has the delete_repo permission).
-->
<script lang="ts">
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { deletePracticeRepositories, listPracticeRepositories } from '$lib/tauri/commands';

	let { canDeleteRepos }: { canDeleteRepos: boolean } = $props();

	const confirmPromptId = $props.id();

	let repositoryNames: string[] | null = $state(null);
	let isConfirming = $state(false);

	/** The sentence in the live region (read aloud, and shown), or null when empty. */
	let message: string | null = $state(null);

	let deleteButton: HTMLButtonElement | null = $state(null);
	let cancelButton: HTMLButtonElement | null = $state(null);
	let statusElement: HTMLElement | null = $state(null);

	/** The confirm question, in the singular when one repository is listed. */
	const confirmQuestion = $derived(
		(repositoryNames ?? []).length === 1
			? 'Delete this repository from GitHub? This cannot be undone.'
			: `Delete these ${(repositoryNames ?? []).length} repositories from GitHub? This cannot be undone.`
	);

	/**
	 * Puts a sentence in the live region. The region is cleared first, so a sentence that repeats
	 * ("Nothing was deleted.") is announced again.
	 * @param text - the sentence to show and announce
	 */
	async function announce(text: string): Promise<void> {
		message = null;
		await tick();
		message = text;
	}

	/** Words for how many repositories were found. */
	function foundSentence(count: number): string {
		if (count === 0) {
			return 'You have no practice repositories.';
		}
		return count === 1 ? 'Found 1 practice repository.' : `Found ${count} practice repositories.`;
	}

	/** Asks GitHub which practice repositories exist and shows them. */
	async function showRepositories(): Promise<void> {
		isConfirming = false;
		await announce('Looking up your repositories…');
		try {
			repositoryNames = await listPracticeRepositories();
			await announce(foundSentence(repositoryNames.length));
		} catch (error) {
			await announce(`Could not list the repositories: ${String(error)}`);
		}
	}

	/** Opens the confirm question and moves focus to its safe choice, "Cancel". */
	async function startConfirming(): Promise<void> {
		isConfirming = true;
		await tick();
		cancelButton?.focus();
	}

	/** Closes the confirm question and puts focus back on the button that opened it. */
	async function cancelConfirming(): Promise<void> {
		isConfirming = false;
		await tick();
		deleteButton?.focus();
	}

	/** Focuses the delete button if it is on screen, otherwise the status message. */
	async function focusAfterDelete(): Promise<void> {
		await tick();
		if (deleteButton !== null) {
			deleteButton.focus();
			return;
		}
		statusElement?.focus();
	}

	/**
	 * Deletes the listed practice repositories. The app asks once more in its own dialog,
	 * which names them; saying no there deletes nothing. Focus is set when it all ends,
	 * because the native dialog takes focus away from the page.
	 */
	async function confirmDelete(): Promise<void> {
		isConfirming = false;
		const listedNames = repositoryNames ?? [];
		await announce('Deleting…');
		try {
			const deletedNames = await deletePracticeRepositories(listedNames);
			if (deletedNames.length === 0) {
				await announce('Nothing was deleted.');
			} else {
				repositoryNames = listedNames.filter((name) => !deletedNames.includes(name));
				await announce(`Deleted: ${deletedNames.join(', ')}.`);
			}
		} catch (error) {
			await announce(`Could not delete: ${String(error)}`);
		}
		await focusAfterDelete();
	}
</script>

<div class="flex flex-col gap-3 border-t px-5 py-4">
	<div>
		<h3 class="m-0 font-semibold">Delete my practice repositories</h3>
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
				<div
					class="flex flex-wrap items-center gap-2.5"
					role="group"
					aria-labelledby={confirmPromptId}
				>
					<span id={confirmPromptId} class="type-small">{confirmQuestion}</span>
					<Button variant="secondary" onclick={confirmDelete}>Yes, delete them</Button>
					<Button variant="ghost" bind:ref={cancelButton} onclick={cancelConfirming}>Cancel</Button>
				</div>
			{:else}
				<div>
					<Button variant="secondary" bind:ref={deleteButton} onclick={startConfirming}>
						Delete these repositories…
					</Button>
				</div>
			{/if}
		{/if}
	{/if}
	<div
		bind:this={statusElement}
		class="rounded-small focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary"
		role="status"
		aria-live="polite"
		tabindex="-1"
	>
		{#if message !== null}
			<p class="type-small m-0">{message}</p>
		{/if}
	</div>
</div>
