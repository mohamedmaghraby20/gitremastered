<!--
  GitVersionStatus.svelte
  Settings row: asks the Rust core which Git is installed and shows "git version 2.x",
  or a clear message (marked with a word, not color alone) when Git cannot be found.
  Input: none.
-->
<script lang="ts">
	import { getGitVersion } from '$lib/tauri/commands';

	// Started once when the row appears; the {#await} block below shows each stage.
	const gitVersionRequest = getGitVersion();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
	<div>
		<div class="font-semibold">Git on this computer</div>
		<div class="type-small text-ink-muted">The terminal and the lessons use this Git.</div>
	</div>
	<span class="type-code flex items-center gap-2" aria-live="polite">
		{#await gitVersionRequest}
			<span class="text-ink-muted">Checking…</span>
		{:then gitVersion}
			<span class="text-success" aria-hidden="true">✓</span>
			git version {gitVersion}
		{:catch}
			<span class="text-danger" aria-hidden="true">✗</span>
			<span>Git not found</span>
		{/await}
	</span>
</div>
