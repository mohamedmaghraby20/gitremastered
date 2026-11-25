<!--
  +page.svelte (settings, "/settings")
  Settings, as in the prototype. For now: Appearance → Theme (light, dark or the computer's
  setting; saved between sessions from task 21) and Terminal → the installed Git version.
-->
<script lang="ts">
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { applyTheme, readAppliedTheme, type ThemeChoice } from '$lib/theme/theme';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import GitVersionStatus from '$lib/components/settings/GitVersionStatus.svelte';

	const themeOptions: SegmentedSwitchOption<ThemeChoice>[] = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' }
	];

	let chosenTheme: ThemeChoice = $state(readAppliedTheme());

	/**
	 * Applies the theme the student picked and remembers it for the switch.
	 * @param newTheme - "light", "dark" or "system"
	 */
	function chooseTheme(newTheme: ThemeChoice): void {
		applyTheme(newTheme);
		chosenTheme = newTheme;
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Settings')}</title>
</svelte:head>

<div class="flex max-w-205 flex-col gap-7 px-12 pt-10 pb-12">
	<h1 class="type-h1 m-0">Settings</h1>

	<section aria-labelledby="appearance-heading" class="rounded-medium border bg-surface">
		<h2 id="appearance-heading" class="type-h3 m-0 border-b px-5 py-3.5">Appearance</h2>
		<div class="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
			<div>
				<div class="font-semibold">Theme</div>
				<div class="type-small text-ink-muted">The terminal stays dark in every theme.</div>
			</div>
			<SegmentedSwitch
				groupLabel="Theme"
				options={themeOptions}
				value={chosenTheme}
				onchange={chooseTheme}
			/>
		</div>
	</section>

	<section aria-labelledby="terminal-heading" class="rounded-medium border bg-surface">
		<h2 id="terminal-heading" class="type-h3 m-0 border-b px-5 py-3.5">Terminal</h2>
		<GitVersionStatus />
	</section>
</div>
