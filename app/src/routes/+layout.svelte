<!--
  +layout.svelte (root layout)
  Wraps every page in the app shell: the top bar across the top, the sidebar on the left,
  and the page itself on the right. Lesson pages fold the sidebar into the 64px icon rail.
  It also loads the saved progress (and theme) when the app opens.
-->
<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import TopBar from '$lib/components/app-shell/TopBar.svelte';
	import Sidebar from '$lib/components/app-shell/Sidebar.svelte';
	import { loadProgress } from '$lib/stores/progress';
	import { applyTheme } from '$lib/theme/theme';

	let { children }: { children: Snippet } = $props();

	const currentPath = $derived(page.url.pathname);
	const isLessonPage = $derived(currentPath.startsWith('/lessons/'));

	// Loads saved progress once when the app opens, and applies the saved theme.
	$effect(() => {
		void loadProgress().then((savedProgress) => applyTheme(savedProgress.theme));
	});
</script>

<!-- Exactly the window height: the top bar stays put and each page scrolls inside <main>. -->
<div class="flex h-screen flex-col">
	<TopBar {currentPath} />
	<div class="flex min-h-0 flex-1">
		<Sidebar {currentPath} variant={isLessonPage ? 'rail' : 'full'} />
		<main class="min-h-0 min-w-0 flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
