<!--
  +page.svelte (settings, "/settings")
  Settings, as in the prototype. Appearance: theme, lesson text size, reduce motion.
  Terminal: the installed Git version. Progress: reset. About: version, credits and licenses.
  Every setting applies at once and is saved between sessions.
  (The shell choice, Git Bash or PowerShell, waits for phase 5: the lessons use bash.)
-->
<script lang="ts">
	import { buildPageTitle } from '$lib/app-info/page-title';
	import { applyTheme, readAppliedTheme, type ThemeChoice } from '$lib/theme/theme';
	import { SegmentedSwitch, type SegmentedSwitchOption } from '$lib/components/ui/segmented-switch';
	import SettingRow from '$lib/components/settings/SettingRow.svelte';
	import LessonTextSizeRow from '$lib/components/settings/LessonTextSizeRow.svelte';
	import ReduceMotionRow from '$lib/components/settings/ReduceMotionRow.svelte';
	import GitVersionStatus from '$lib/components/settings/GitVersionStatus.svelte';
	import ResetProgress from '$lib/components/settings/ResetProgress.svelte';
	import AboutSection from '$lib/components/settings/AboutSection.svelte';
	import { saveThemeChoice } from '$lib/stores/progress';

	const themeOptions: SegmentedSwitchOption<ThemeChoice>[] = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' }
	];

	let chosenTheme: ThemeChoice = $state(readAppliedTheme());

	/**
	 * Applies the theme the student picked, shows it on the switch and saves it.
	 * @param newTheme - "light", "dark" or "system"
	 */
	function chooseTheme(newTheme: ThemeChoice): void {
		applyTheme(newTheme);
		chosenTheme = newTheme;
		void saveThemeChoice(newTheme);
	}
</script>

<svelte:head>
	<title>{buildPageTitle('Settings')}</title>
</svelte:head>

<div class="flex max-w-205 flex-col gap-7 px-12 pt-10 pb-12">
	<h1 class="type-h1 m-0">Settings</h1>

	<section aria-labelledby="appearance-heading" class="rounded-medium border bg-surface">
		<h2 id="appearance-heading" class="type-h3 m-0 border-b px-5 py-3.5">Appearance</h2>
		<SettingRow name="Theme" explanation="The terminal stays dark in every theme.">
			<SegmentedSwitch
				groupLabel="Theme"
				options={themeOptions}
				value={chosenTheme}
				onchange={chooseTheme}
			/>
		</SettingRow>
		<LessonTextSizeRow />
		<ReduceMotionRow />
	</section>

	<section aria-labelledby="terminal-heading" class="rounded-medium border bg-surface">
		<h2 id="terminal-heading" class="type-h3 m-0 border-b px-5 py-3.5">Terminal</h2>
		<GitVersionStatus />
	</section>

	<section aria-labelledby="progress-heading" class="rounded-medium border bg-surface">
		<h2 id="progress-heading" class="type-h3 m-0 border-b px-5 py-3.5">Progress</h2>
		<ResetProgress />
	</section>

	<AboutSection />
</div>
