<!--
  +page.svelte (home page)
  A placeholder home screen. Task 6 replaces it with the real app shell and pages.
-->
<script lang="ts">
	import { appName, buildPageTitle } from '$lib/app-info/page-title';
</script>

<svelte:head>
	<title>{buildPageTitle()}</title>
</svelte:head>

<main>
	<h1>{appName}</h1>
	<p>Learn Git by using it.</p>
</main>
