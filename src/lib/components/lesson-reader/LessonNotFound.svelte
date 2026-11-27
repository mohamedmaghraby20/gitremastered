<!--
  LessonNotFound.svelte
  Shown when a lesson address names a lesson that does not exist, with a way back to the course map.
  Input: lessonId, the ID from the address.
-->
<script lang="ts">
	import { resolve } from '$app/paths';

	let { lessonId }: { lessonId: string } = $props();
</script>

<div class="flex max-w-160 flex-col gap-3 px-12 pt-10 pb-12">
	<h1 class="type-h1 m-0">Lesson not found</h1>
	<p class="type-lesson m-0 text-ink-muted">
		There is no lesson called <code class="type-code">{lessonId}</code>. It may have been renamed,
		or the address has a typo.
	</p>
	<p class="m-0">
		<a href={resolve('/course-map')} class="text-link hover:underline">Open the course map</a>
	</p>
</div>
