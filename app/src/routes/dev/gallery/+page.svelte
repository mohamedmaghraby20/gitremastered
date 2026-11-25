<!--
  +page.svelte (/dev/gallery)
  Developer gallery: every design token in the light and dark themes side by side,
  plus buttons that switch the whole app's theme. Not linked from the app; open it by URL.
-->
<script lang="ts">
	import designTokensJson from '../../../../../docs/design/tokens.json';
	import type { DesignTokens } from '$lib/types/design-tokens';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { applyTheme, readAppliedTheme, themeChoices, type ThemeChoice } from '$lib/theme/theme';
	import ThemePanel from '$lib/components/dev-gallery/ThemePanel.svelte';

	const designTokens = designTokensJson as DesignTokens;

	let currentTheme: ThemeChoice = $state(readAppliedTheme());

	/**
	 * Switches the whole app to a theme and remembers it for the buttons.
	 * @param themeChoice - "light", "dark" or "system"
	 */
	function chooseTheme(themeChoice: ThemeChoice): void {
		applyTheme(themeChoice);
		currentTheme = themeChoice;
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Design gallery')}</title>
</svelte:head>

<main class="gallery">
	<header class="gallery-header">
		<h1 class="type-h1">Design gallery</h1>
		<div class="theme-switch" role="group" aria-label="App theme">
			{#each themeChoices as themeChoice (themeChoice)}
				<button
					type="button"
					aria-pressed={currentTheme === themeChoice}
					onclick={() => chooseTheme(themeChoice)}
				>
					{themeChoice}
				</button>
			{/each}
		</div>
	</header>

	<div class="panels">
		<ThemePanel themeId="light" title="Light theme" {designTokens} />
		<ThemePanel themeId="dark" title="Dark theme" {designTokens} />
	</div>
</main>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-8);
	}

	.gallery-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.gallery-header h1 {
		margin: 0;
	}

	/* Plain buttons for now; the real keycap buttons arrive in task 5. */
	.theme-switch {
		display: flex;
		gap: var(--space-2);
	}

	.theme-switch button {
		padding: var(--space-1) var(--space-3);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-medium);
		background: var(--surface);
		color: var(--ink);
		font: inherit;
		text-transform: capitalize;
		cursor: pointer;
	}

	.theme-switch button[aria-pressed='true'] {
		background: var(--primary);
		color: var(--on-primary);
	}

	.panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}
</style>
