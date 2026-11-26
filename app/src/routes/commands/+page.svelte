<!--
  +page.svelte (command index, "/commands")
  The command index's first page: what it is, and a link to every group's first command, so
  the student can start from the list on the left or from here.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { listCommandGroups } from '$lib/command-index/command-index-data';

	const commandGroups = listCommandGroups();
</script>

<svelte:head>
	<title>{buildPageTitle('Command index')}</title>
</svelte:head>

<div class="flex max-w-205 flex-col gap-6 px-12 py-9">
	<div class="flex flex-col gap-2">
		<span class="type-caption text-ink-muted uppercase">Reference</span>
		<h1 class="type-h1 m-0">Command index</h1>
		<p class="type-lede m-0">
			Every command the course teaches, on one page each: what it does, how to type it, and the
			lessons that teach it. Pick one on the left, or switch to Terms for the words Git uses.
		</p>
	</div>
	<ul class="m-0 flex list-none flex-col gap-3 p-0">
		{#each commandGroups as group (group.name)}
			<li class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
				<span class="type-caption w-28 text-ink-muted uppercase">{group.name}</span>
				{#each group.commands as commandPage (commandPage.id)}
					<a
						href={resolve('/commands/[commandId]', { commandId: commandPage.id })}
						class="type-code"
					>
						{commandPage.command}
					</a>
				{/each}
			</li>
		{/each}
	</ul>
</div>
