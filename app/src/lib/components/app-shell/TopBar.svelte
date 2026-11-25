<!--
  TopBar.svelte
  The 48px bar across the top of every screen: the wordmark (goes Home), the search box
  (goes to Search; Ctrl+K or Cmd+K from anywhere), and the Settings link.
  Input: currentPath, the path of the page on screen (to mark Settings when it is open).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { isLinkActive } from '$lib/navigation/navigation-links';
	import { isSearchShortcut } from '$lib/navigation/keyboard-shortcuts';

	let { currentPath }: { currentPath: string } = $props();

	const isSettingsOpen = $derived(isLinkActive(currentPath, '/settings'));

	/**
	 * Opens the search page when the student presses the search shortcut.
	 * @param keyEvent - any key press in the window
	 */
	function handleWindowKeydown(keyEvent: KeyboardEvent): void {
		if (!isSearchShortcut(keyEvent)) {
			return;
		}
		keyEvent.preventDefault();
		void goto(resolve('/search'));
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header class="flex h-12 shrink-0 items-center gap-4 border-b bg-surface px-4">
	<a href={resolve('/')} class="type-h3 text-ink">
		<span class="bg-highlight px-1 py-0.5 text-on-highlight">git</span>remastered
	</a>

	<a
		href={resolve('/search')}
		class="type-small mx-auto flex max-w-130 flex-1 items-center justify-between gap-2 rounded-medium border bg-surface-sunken px-3 py-1.5 text-ink-faint"
	>
		Search lessons, commands, terms
		<kbd
			class="type-label-mono rounded-small border border-b-2 border-border-strong px-1.5 text-ink-muted"
		>
			Ctrl K
		</kbd>
	</a>

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
