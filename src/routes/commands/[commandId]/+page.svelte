<!--
  +page.svelte (one command, "/commands/<commandId>")
  Shows one command's page, or a short note for an unknown command ID.
-->
<script lang="ts">
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import CommandPageView from '$lib/components/command-index/CommandPageView.svelte';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{buildPageTitle(data.commandPage?.command ?? 'Command not found')}</title>
</svelte:head>

{#if data.commandPage === null}
	<div class="flex flex-col gap-2 px-12 py-9">
		<h1 class="type-h1 m-0">Command not found</h1>
		<p class="m-0 text-ink-muted">
			There is no page for "{data.commandId}". Pick a command on the left, or go back to the
			<a href={resolve('/commands')}>command index</a>.
		</p>
	</div>
{:else}
	<CommandPageView commandPage={data.commandPage} lessonCards={data.lessonCards} />
{/if}
