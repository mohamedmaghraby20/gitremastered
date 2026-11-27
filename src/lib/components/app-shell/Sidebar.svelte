<!--
  Sidebar.svelte
  The sidebar on the left of every screen, in one of two shapes:
  "full" (248px, links with text) or "rail" (64px, icons only, used on lesson pages).
  Inputs: currentPath (the path of the page on screen), variant ("full" or "rail").
-->
<script lang="ts">
	import SidebarFull from './SidebarFull.svelte';
	import SidebarRail from './SidebarRail.svelte';

	let { currentPath, variant }: { currentPath: string; variant: 'full' | 'rail' } = $props();
</script>

{#if variant === 'rail'}
	<SidebarRail {currentPath} />
{:else}
	<SidebarFull {currentPath} />
{/if}
