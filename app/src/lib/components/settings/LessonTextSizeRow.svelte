<!--
  LessonTextSizeRow.svelte
  Settings row: a slider for the lesson text size (16 to 22 px). The new size applies at once
  to every lesson and is saved; "Reset" goes back to the design's size.
  Input: none (reads and saves the progress store).
-->
<script lang="ts">
	import { progress, saveLessonTextSize } from '$lib/stores/progress';
	import {
		applyLessonTextSize,
		defaultLessonTextSize,
		lessonTextSizeRange
	} from '$lib/settings/display-settings';
	import { Button } from '$lib/components/ui/button';
	import SettingRow from './SettingRow.svelte';

	const shownSize = $derived($progress.lessonTextSize ?? defaultLessonTextSize);

	/**
	 * Applies and saves the size the slider moved to.
	 * @param inputEvent - the slider's input event
	 */
	function changeSize(inputEvent: Event): void {
		const newSize = Number((inputEvent.currentTarget as HTMLInputElement).value);
		const savedSize = newSize === defaultLessonTextSize ? null : newSize;
		applyLessonTextSize(savedSize);
		void saveLessonTextSize(savedSize);
	}

	/** Goes back to the design's size. */
	function resetSize(): void {
		applyLessonTextSize(null);
		void saveLessonTextSize(null);
	}
</script>

<SettingRow
	name="Lesson text size"
	explanation={`Currently ${shownSize} px. The design's size is ${defaultLessonTextSize} px.`}
	controlId="lesson-text-size"
>
	<div class="flex items-center gap-3">
		<input
			id="lesson-text-size"
			type="range"
			min={lessonTextSizeRange.smallest}
			max={lessonTextSizeRange.largest}
			step="1"
			value={shownSize}
			oninput={changeSize}
			aria-valuetext={`${shownSize} pixels`}
			class="w-50 accent-primary"
		/>
		<Button variant="ghost" onclick={resetSize} disabled={$progress.lessonTextSize === null}>
			Reset
		</Button>
	</div>
</SettingRow>
