<!--
  CommandIndexNav.svelte
  The command index's left list: a Commands / Terms switch, then either the commands in their
  groups or the glossary terms. The command or term on screen is marked (highlighter wash and
  an ink edge), and links carry aria-current for screen readers.

  Inputs: groups (commands in their groups), terms (every glossary term),
          currentPath (the page on screen, to mark the current item and set the switch).
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { CommandGroup } from '$lib/command-index/group-commands';
	import type { GlossaryTerm } from '$lib/types/reference';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';

	let {
		groups,
		terms,
		currentPath
	}: { groups: CommandGroup[]; terms: GlossaryTerm[]; currentPath: string } = $props();

	type ListKind = 'commands' | 'terms';
	const listOptions: SegmentedSwitchOption<ListKind>[] = [
		{ value: 'commands', label: 'Commands' },
		{ value: 'terms', label: 'Terms' }
	];

	const shownList: ListKind = $derived(
		currentPath.startsWith('/commands/terms') ? 'terms' : 'commands'
	);

	/**
	 * Opens the list the student picked: the first command, or the glossary.
	 * @param listKind - "commands" or "terms"
	 */
	function showList(listKind: ListKind): void {
		const firstCommandId = groups[0]?.commands[0]?.id;
		if (listKind === 'terms') {
			void goto(resolve('/commands/terms'));
		} else if (firstCommandId !== undefined) {
			void goto(resolve('/commands/[commandId]', { commandId: firstCommandId }));
		}
	}

	/** Classes for one list link; the one on screen gets the highlighter wash and an ink edge. */
	const linkClasses =
		'type-label-mono block px-5 py-1.5 text-ink no-underline hover:bg-surface-sunken';
	const currentClasses = 'bg-git-staging-wash font-bold shadow-[inset_3px_0_0_var(--primary)]';
</script>

<nav
	aria-label="Commands and terms"
	class="flex w-64 shrink-0 flex-col gap-4.5 overflow-y-auto border-r bg-surface py-6"
>
	<div class="px-5">
		<SegmentedSwitch
			groupLabel="Show"
			options={listOptions}
			value={shownList}
			onchange={showList}
		/>
	</div>

	{#if shownList === 'commands'}
		{#each groups as group (group.name)}
			<div class="flex flex-col">
				<span class="type-caption px-5 pb-1.5 text-ink-muted uppercase">{group.name}</span>
				{#each group.commands as commandPage (commandPage.id)}
					{@const commandHref = resolve('/commands/[commandId]', { commandId: commandPage.id })}
					{@const isCurrent = currentPath === commandHref}
					<a
						href={commandHref}
						aria-current={isCurrent ? 'page' : undefined}
						class={[linkClasses, isCurrent && currentClasses]}
					>
						{commandPage.command}
					</a>
				{/each}
			</div>
		{/each}
	{:else}
		<div class="flex flex-col">
			{#each terms as term (term.id)}
				<!-- resolve() builds the page address; the #term part only scrolls within that page. -->
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={`${resolve('/commands/terms')}#${term.id}`} class={linkClasses}>{term.term}</a>
			{/each}
		</div>
	{/if}
</nav>
