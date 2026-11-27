<!--
  VisualizerSample.svelte
  Dev gallery: the visualizer board with two made-up repos and a caption, so it can be
  checked without the desktop app. The first is the pilot's simple case (two commits, one
  staged file, one edited file, one new file). The second shows everything a branching or
  remote lesson can put on the board: two branches side by side, a remote-tracking branch, a
  tag, a commit no branch reaches, a merge stopped on a conflict, and stashed work.
-->
<script lang="ts">
	import type { RepoSnapshot } from '@gitremastered/course-engine/types/repo-snapshot';
	import {
		localBranch,
		remoteBranch,
		sampleCommit,
		snapshotWith
	} from '@gitremastered/course-engine/types/snapshot-samples';
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
				authoredAt: '2026-11-25T10:05:00+00:00',
				isReachable: true,
				isSigned: false,
				changedPaths: []
			},
			{
				id: firstId,
				message: 'First commit',
				parentIds: [],
				authorName: 'Student',
				authoredAt: '2026-11-25T10:00:00+00:00',
				isReachable: true,
				isSigned: false,
				changedPaths: []
			}
		],
		branches: [
			{ name: 'main', commitId: secondId, isRemote: false, upstream: null, ahead: 0, behind: 0 }
		],
		tags: [],
		head: { kind: 'branch', branchName: 'main', commitId: secondId },
		stagedFiles: [{ path: 'notes.txt', changeKind: 'added', oldPath: null }],
		modifiedFiles: [{ path: 'README.md', changeKind: 'modified', oldPath: null }],
		untrackedFiles: ['draft.txt'],
		committedFiles: [],
		conflictedFiles: [],
		operation: null,
		stashes: [],
		remotes: [],
		localConfig: [],
		answer: null,
		workingFileTexts: [],
		committedFileTexts: [],
		worktrees: [],
		submodules: [],
		sparseSkippedFiles: []
	};

	const featureId = 'c4e81aa'.padEnd(40, '0');
	const mainId = '9f02b6d'.padEnd(40, '0');
	const lostId = 'e77a310'.padEnd(40, '0');

	const branchingSnapshot: RepoSnapshot = snapshotWith({
		commits: [
			sampleCommit(featureId, 'Start login', [secondId]),
			sampleCommit(lostId, 'Fix tpyo', [secondId], false),
			sampleCommit(mainId, 'Fix typo', [secondId]),
			sampleCommit(secondId, 'Add app.js', [firstId]),
			sampleCommit(firstId, 'First commit')
		],
		branches: [
			{ ...localBranch('main', mainId), upstream: 'origin/main', ahead: 1 },
			localBranch('feature', featureId),
			remoteBranch('origin/main', secondId)
		],
		tags: [{ name: 'v1.0', commitId: firstId, isAnnotated: true }],
		head: { kind: 'branch', branchName: 'main', commitId: mainId },
		modifiedFiles: [{ path: 'app.js', changeKind: 'modified', oldPath: null }],
		conflictedFiles: ['app.js'],
		operation: 'merge',
		stashes: ['WIP on main: 9f02b6d Fix typo']
	});

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
<div class="flex h-160 flex-col">
	<VisualizerBoard snapshot={branchingSnapshot} caption={null}>
		{#snippet history()}
			<HistoryMap snapshot={branchingSnapshot} />
		{/snippet}
	</VisualizerBoard>
</div>
