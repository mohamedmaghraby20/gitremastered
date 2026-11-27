<!--
  +page.svelte (/dev/gallery)
  Developer gallery: every design token in the light and dark themes side by side,
  plus a switch for the whole app's theme. Not linked from the app; open it by URL.
-->
<script lang="ts">
	import designTokensJson from '../../../../../../docs/design/tokens.json';
	import type { DesignTokens } from '$lib/types/design-tokens';
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { applyTheme, readAppliedTheme, themeChoices, type ThemeChoice } from '$lib/theme/theme';
	import ThemePanel from '$lib/components/dev-gallery/ThemePanel.svelte';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';

	const designTokens = designTokensJson as DesignTokens;

	/** The theme switch's options, like { value: "dark", label: "Dark" }. */
	const themeOptions: SegmentedSwitchOption<ThemeChoice>[] = themeChoices.map((themeChoice) => ({
		value: themeChoice,
		label: themeChoice.charAt(0).toUpperCase() + themeChoice.slice(1)
	}));

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

<div class="gallery">
	<header class="gallery-header">
		<h1 class="type-h1">Design gallery</h1>
		<SegmentedSwitch
			groupLabel="App theme"
			options={themeOptions}
			value={currentTheme}
			onchange={chooseTheme}
		/>
	</header>

	<div class="panels">
		<ThemePanel themeId="light" title="Light theme" {designTokens} />
		<ThemePanel themeId="dark" title="Dark theme" {designTokens} />
	</div>
</div>

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

	.panels {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-6);
	}
</style>
