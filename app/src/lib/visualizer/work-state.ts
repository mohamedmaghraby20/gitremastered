/**
 * work-state.ts
 * Words for the parts of a snapshot that are not files or commits: an operation waiting to
 * be finished (a merge that stopped on a conflict), the stash, and how far the current
 * branch is from the branch it follows on the remote. Pure logic, no screen code.
 */

import type { Operation, RepoSnapshot } from '$lib/types/repo-snapshot';

/** A banner for an operation in progress: what is happening and how to move on. */
export type OperationBanner = { title: string; nextStep: string };

/** How each operation is finished or given up, once no file is conflicted any more. */
const operationSteps: Record<Operation, { name: string; finish: string; giveUp: string }> = {
	merge: { name: 'Merge', finish: 'git commit', giveUp: 'git merge --abort' },
	rebase: { name: 'Rebase', finish: 'git rebase --continue', giveUp: 'git rebase --abort' },
	revert: { name: 'Revert', finish: 'git revert --continue', giveUp: 'git revert --abort' },
	'cherry-pick': {
		name: 'Cherry-pick',
		finish: 'git cherry-pick --continue',
		giveUp: 'git cherry-pick --abort'
	},
	bisect: {
		name: 'Bisect',
		finish: 'git bisect good or git bisect bad',
		giveUp: 'git bisect reset'
	}
};

/**
 * Describes the operation that is waiting to be finished, if there is one.
 * @param snapshot - the repo state
 * @returns the banner, or null when Git is idle
 */
export function describeOperation(snapshot: RepoSnapshot): OperationBanner | null {
	if (snapshot.operation === null) {
		return null;
	}
	const steps = operationSteps[snapshot.operation];
	const conflictCount = snapshot.conflictedFiles.length;
	if (conflictCount > 0) {
		const files = conflictCount === 1 ? '1 file has' : `${conflictCount} files have`;
		return {
			title: `${steps.name} stopped: ${files} a conflict`,
			nextStep: `Fix each file, git add it, then ${steps.finish}. To give up: ${steps.giveUp}.`
		};
	}
	return {
		title: `${steps.name} in progress`,
		nextStep: `Finish with ${steps.finish}. To give up: ${steps.giveUp}.`
	};
}

/**
 * Says how the branch you are on compares with the branch it follows on the remote.
 * @param snapshot - the repo state
 * @returns e.g. "level with origin/main", "2 ahead of origin/main",
 *   "1 ahead, 3 behind origin/main"; null when HEAD is detached or the branch follows nothing
 */
export function describeUpstream(snapshot: RepoSnapshot): string | null {
	const head = snapshot.head;
	if (head.kind !== 'branch') {
		return null;
	}
	const branch = snapshot.branches.find(
		(candidate) => !candidate.isRemote && candidate.name === head.branchName
	);
	if (branch === undefined || branch.upstream === null) {
		return null;
	}
	if (branch.ahead === 0 && branch.behind === 0) {
		return `level with ${branch.upstream}`;
	}
	if (branch.behind === 0) {
		return `${branch.ahead} ahead of ${branch.upstream}`;
	}
	if (branch.ahead === 0) {
		return `${branch.behind} behind ${branch.upstream}`;
	}
	return `${branch.ahead} ahead, ${branch.behind} behind ${branch.upstream}`;
}
