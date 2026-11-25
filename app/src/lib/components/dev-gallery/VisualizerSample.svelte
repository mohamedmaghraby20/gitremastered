<!--
  VisualizerSample.svelte
  Dev gallery: the visualizer board with a made-up repo (two commits, one staged file, one
  edited file, one new file) and a caption, so it can be checked without the desktop app.
-->
<script lang="ts">
	import type { RepoSnapshot } from '$lib/types/repo-snapshot';
	import HistoryMap from '$lib/components/visualizer/HistoryMap.svelte';
	import VisualizerBoard from '$lib/components/visualizer/VisualizerBoard.svelte';

	const firstId = 'a1f3c9e'.padEnd(40, '0');
	const secondId = '7bd20e4'.padEnd(40, '0');

	const sampleSnapshot: RepoSnapshot = {
		commits: [
			{
				id: secondId,
				message: 'Add app.js',
				parentIds: [firstId],
				authorName: 'Student',
				authoredAt: '2026-11-25T10:05:00+00:00'
			},
			{
				id: firstId,
				message: 'First commit',
				parentIds: [],
				authorName: 'Student',
				authoredAt: '2026-11-25T10:00:00+00:00'
			}
		],
		branches: [{ name: 'main', commitId: secondId, isRemote: false }],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: secondId },
		stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }],
		modifiedFiles: [{ path: 'README.md', changeKind: 'modified', oldPath: null }],
		untrackedFiles: ['draft.txt']
	};

	const sampleCaption = {
		commandLine: 'git add notes.txt',
		explanation: 'notes.txt moved to the staging area. Commit to save a snapshot.'
	};
</script>

<div class="flex h-120 flex-col">
	<VisualizerBoard snapshot={sampleSnapshot} caption={sampleCaption}>
		{#snippet history()}
			<HistoryMap snapshot={sampleSnapshot} />
		{/snippet}
	</VisualizerBoard>
</div>
