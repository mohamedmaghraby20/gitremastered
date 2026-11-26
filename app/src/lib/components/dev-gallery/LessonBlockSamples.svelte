<!--
  LessonBlockSamples.svelte
  Dev gallery: one sample of every special lesson block, written with the same markers lesson
  authors use, so the gallery shows exactly what a lesson would.
-->
<script lang="ts">
	import LessonBlocks from '$lib/components/lesson-reader/LessonBlocks.svelte';
	import RecapCard from '$lib/components/lesson-reader/RecapCard.svelte';

	const sampleMarkdown = [
		'Plain lesson text with a **key term** and `inline code`.',
		':::definitions',
		'- term: Working tree',
		'  area: working',
		'  text: The files you see and edit.',
		'- term: Staging area',
		'  area: staging',
		'  text: The next commit, being put together.',
		'- term: Repository',
		'  area: repository',
		'  text: Every commit you have saved.',
		':::',
		':::try-it',
		'1. Run `git add notes.txt`.',
		'2. Run `git status` again.',
		':::',
		':::careful',
		'Edit after `git add`? Stage the file again.',
		':::',
		':::sidenote',
		'Read git add as "add precisely this content to the next commit".',
		':::',
		':::compare',
		'today: "`git restore --staged notes.txt`"',
		'book: "`git reset HEAD notes.txt`"',
		':::'
	].join('\n');

	const sampleRecap = '- One recap point.\n- Another recap point.';
</script>

<LessonBlocks markdown={sampleMarkdown} />
<RecapCard markdown={sampleRecap} />
