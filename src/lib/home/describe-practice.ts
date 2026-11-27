/**
 * describe-practice.ts
 * Turns the practice repository's three areas into one plain sentence for the home screen,
 * like "notes.txt is staged but not committed yet." It names the step the student is in the
 * middle of: staged work first (it is the closest to a commit), then unstaged edits.
 */

import type { DeskZones } from '$lib/visualizer/area-zones';

/**
 * Describes where the practice repository stands.
 * @param zones - the files sorted into working tree, staging area and repository
 * @returns one sentence, ending with a full stop
 */
export function describePracticeState(zones: DeskZones): string {
	if (zones.staging.length === 1) {
		return `${zones.staging[0].path} is staged but not committed yet.`;
	}
	if (zones.staging.length > 1) {
		return `${zones.staging.length} files are staged but not committed yet.`;
	}
	if (zones.working.length === 1) {
		return `${zones.working[0].path} has changes that are not staged yet.`;
	}
	if (zones.working.length > 1) {
		return `${zones.working.length} files have changes that are not staged yet.`;
	}
	return 'Everything is committed: the working tree is clean.';
}
