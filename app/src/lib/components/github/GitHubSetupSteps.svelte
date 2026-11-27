<!--
  GitHubSetupSteps.svelte
  The short guided setup for the GitHub CLI: install it, sign in, let Git use that login.
  Each command sits in its own selectable box, so it is easy to copy into the terminal.
  Shared by the consent card and the Settings section.
  Inputs: none (the caller puts the "Check again" button next to it).
-->
<script lang="ts">
	import { handleExternalLinkClick } from '$lib/tauri/open-external';

	const installPageAddress = 'https://docs.github.com/en/github-cli/github-cli/quickstart';
</script>

{#snippet command(commandText: string)}
	<code class="type-code rounded-small bg-surface-sunken px-1.5 py-0.5 select-all">
		{commandText}
	</code>
{/snippet}

<ol class="m-0 flex flex-col gap-3 pl-5">
	<li>
		<span class="font-semibold">Install the GitHub CLI.</span>
		<ul class="type-small m-0 mt-1 flex list-none flex-col gap-1 p-0">
			<li>Windows: {@render command('winget install --id GitHub.cli')}</li>
			<li>macOS: {@render command('brew install gh')}</li>
			<li>
				Linux: see the
				<a
					class="text-link underline"
					href={installPageAddress}
					onclick={(event) => handleExternalLinkClick(event, installPageAddress)}
				>
					install page
				</a>
				for your distribution.
			</li>
		</ul>
	</li>
	<li>
		<span class="font-semibold">Sign in.</span>
		{@render command('gh auth login --scopes workflow')}
		<span class="type-small text-ink-muted">
			Choose GitHub.com, HTTPS, and log in with a web browser. The extra "workflow" permission lets
			you push GitHub Actions files in the CI lessons. Already signed in? Run
			<code class="type-code">gh auth refresh -h github.com -s workflow</code> instead.
		</span>
	</li>
	<li>
		<span class="font-semibold">Let Git use that login.</span>
		{@render command('gh auth setup-git')}
	</li>
	<li><span class="font-semibold">Press "Check again".</span></li>
</ol>
