<!--
  +page.svelte (glossary, "/commands/terms")
  The command index's Terms page: every glossary term with its meaning and lessons.
-->
<script lang="ts">
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { listTermsWithLessons } from '$lib/command-index/command-index-data';
	import GlossaryList from '$lib/components/command-index/GlossaryList.svelte';

	const terms = listTermsWithLessons();
</script>

<svelte:head>
	<title>{buildPageTitle('Terms')}</title>
</svelte:head>

<GlossaryList {terms} />
