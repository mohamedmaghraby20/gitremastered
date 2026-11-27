<!--
  AboutSection.svelte
  Settings card "About": the app's name and version, and the credits and licenses: the course
  is built on Pro Git (CC BY-NC-SA 3.0), the app's code is MIT.
  Input: none.
-->
<script lang="ts">
	import { appName } from '$lib/app-info/page-title';
	import { appVersion } from '$lib/app-info/app-version';
	import { handleExternalLinkClick } from '$lib/tauri/open-external';

	const proGitUrl = 'https://git-scm.com/book';

	/**
	 * Opens the Pro Git link in the system browser instead of inside the app.
	 * @param event - the click
	 */
	function openProGit(event: MouseEvent): void {
		handleExternalLinkClick(event, proGitUrl);
	}
</script>

<section aria-labelledby="about-heading" class="rounded-medium border bg-surface">
	<h2 id="about-heading" class="type-h3 m-0 border-b px-5 py-3.5">About</h2>
	<div class="flex flex-col gap-2 px-5 py-3.5">
		<span>
			{appName}
			<span class="type-label-mono text-ink-muted">v{appVersion}</span>
		</span>
		<p class="type-sidenote m-0 text-ink-muted">
			Built on
			<!-- The online Pro Git is not an app page; the click opens the system browser. -->
			<!-- eslint-disable svelte/no-navigation-without-resolve -->
			<a href={proGitUrl} target="_blank" rel="noreferrer" onclick={openProGit}>Pro Git</a>
			<!-- eslint-enable svelte/no-navigation-without-resolve -->
			by Scott Chacon and Ben Straub, licensed CC BY-NC-SA 3.0. The course text follows the same license;
			the app's code is MIT.
		</p>
	</div>
</section>
