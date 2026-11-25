<!--
  +page.svelte (one lesson, "/lessons/<lessonId>")
  Placeholder until task 10 shows the lesson. The layout already folds the sidebar into the rail here.
-->
<script lang="ts">
	import { page } from '$app/state';
	import EmptyPage from '$lib/components/app-shell/EmptyPage.svelte';
</script>

<EmptyPage title={`Lesson: ${page.params.lessonId ?? ''}`} comingIn="task 10" />
