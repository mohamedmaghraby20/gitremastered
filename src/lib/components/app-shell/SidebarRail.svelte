<!--
  SidebarRail.svelte
  The folded, 64px-wide sidebar used on lesson pages: one icon per main link.
  Each icon link has an aria-label, so screen readers still hear "Home", "Settings"…
  Input: currentPath, the path of the page on screen.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { isLinkActive, mainLinks } from '$lib/navigation/navigation-links';
	import NavigationIcon from './NavigationIcon.svelte';

	let { currentPath }: { currentPath: string } = $props();
</script>

<nav
	aria-label="Main"
	class="flex w-16 shrink-0 flex-col items-center gap-1 border-r bg-surface-sunken py-3"
>
	{#each mainLinks as link (link.href)}
		{@const isActive = isLinkActive(currentPath, link.href)}
		<a
			href={resolve(link.href)}
			aria-label={link.label}
			title={link.label}
			aria-current={isActive ? 'page' : undefined}
			class={[
				'flex size-10 items-center justify-center rounded-medium',
				isActive ? 'bg-surface text-ink ring-1 ring-border' : 'text-ink-muted hover:text-ink'
			]}
		>
			<NavigationIcon name={link.icon} />
		</a>
	{/each}
</nav>
