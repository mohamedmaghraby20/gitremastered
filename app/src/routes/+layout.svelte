<!--
  +layout.svelte (root layout)
  Wraps every page. For now it only loads the global styles; task 6 adds the top bar and sidebar.
-->
<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

{@render children()}
