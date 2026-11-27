<!--
  EmptyPage.svelte
  A placeholder page: its title, the window title, and a line saying which task fills it in.
  Inputs: title (the page name), comingIn (e.g. "phase 4").
-->
<script lang="ts">
	import { buildPageTitle } from '$lib/app-info/page-title';

	let { title, comingIn }: { title: string; comingIn: string } = $props();
</script>

<svelte:head>
	<title>{buildPageTitle(title)}</title>
</svelte:head>

<div class="flex flex-col gap-2 px-12 pt-10 pb-12">
	<h1 class="type-h1 m-0">{title}</h1>
	<p class="m-0 text-ink-muted">This page is still empty. It arrives in {comingIn}.</p>
</div>
