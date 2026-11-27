<!--
  TopBar.svelte
  The 48px bar across the top of every screen: the wordmark (goes Home), the search box
  (opens the quick search panel; Ctrl+K or Cmd+K from anywhere), and the Settings link.
  Input: currentPath, the path of the page on screen (to mark Settings when it is open).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { isLinkActive } from '$lib/navigation/navigation-links';
	import { isSearchShortcut } from '$lib/navigation/keyboard-shortcuts';
	import SearchPanel from '$lib/components/search/SearchPanel.svelte';

	let { currentPath }: { currentPath: string } = $props();

	const isSettingsOpen = $derived(isLinkActive(currentPath, '/settings'));
	let isSearchPanelOpen = $state(false);

	/**
	 * Opens the quick search panel when the student presses the search shortcut.
	 * @param keyEvent - any key press in the window
	 */
	function handleWindowKeydown(keyEvent: KeyboardEvent): void {
		if (!isSearchShortcut(keyEvent)) {
			return;
		}
		keyEvent.preventDefault();
		isSearchPanelOpen = true;
	}

	/** Opens the quick search panel from the search box. */
	function openSearchPanel(): void {
		isSearchPanelOpen = true;
	}

	/** Closes the quick search panel. */
	function closeSearchPanel(): void {
		isSearchPanelOpen = false;
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header class="flex h-12 shrink-0 items-center gap-4 border-b bg-surface px-4">
	<a href={resolve('/')} class="type-h3 text-ink">
		<span class="bg-highlight px-1 py-0.5 text-on-highlight">git</span>remastered
	</a>

	<button
		type="button"
		onclick={openSearchPanel}
		aria-haspopup="dialog"
		class="type-small mx-auto flex max-w-130 flex-1 cursor-pointer items-center justify-between gap-2 rounded-medium border bg-surface-sunken px-3 py-1.5 text-ink-faint"
	>
		Search lessons, commands, terms
		<kbd
			class="type-label-mono rounded-small border border-b-2 border-border-strong px-1.5 text-ink-muted"
		>
			Ctrl K
		</kbd>
	</button>

	<a
		href={resolve('/settings')}
		aria-current={isSettingsOpen ? 'page' : undefined}
		class={[
			'type-small px-2.5 py-1.5',
			isSettingsOpen ? 'font-semibold text-ink' : 'text-ink-muted hover:text-ink'
		]}
	>
		Settings
	</a>
</header>

<SearchPanel isOpen={isSearchPanelOpen} onclose={closeSearchPanel} />
