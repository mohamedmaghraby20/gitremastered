<!--
  NavigationIcon.svelte
  The small line icons of the sidebar's icon rail (drawn as inline SVG, colored by the text color).
  Input: name, one of the NavigationIconName values. Hidden from screen readers: the link carries the name.
-->
<script lang="ts">
	import type { NavigationIconName } from '$lib/navigation/navigation-links';

	let { name }: { name: NavigationIconName } = $props();
</script>

<svg
	class="size-4.5"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
	{:else if name === 'course-map'}
		<circle cx="5" cy="6" r="2" />
		<circle cx="5" cy="18" r="2" />
		<circle cx="19" cy="12" r="2" />
		<path d="M5 8v8M7 6h4a4 4 0 0 1 4 4 2 2 0 0 0 2 2" />
	{:else if name === 'commands'}
		<path d="M5 7l5 5-5 5M12 17h7" />
	{:else if name === 'settings'}
		<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
		<circle cx="16" cy="6" r="2" />
		<circle cx="10" cy="12" r="2" />
		<circle cx="18" cy="18" r="2" />
	{/if}
</svg>
