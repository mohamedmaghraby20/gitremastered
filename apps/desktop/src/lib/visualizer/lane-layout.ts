/**
 * lane-layout.ts
 * Places commits on a grid for the metro-map history: a column for how far a commit is from
 * the first commit (older on the left), and a lane (row) for the line of work it belongs to.
 * A straight history stays on one row; branches that run side by side get rows of their own.
 * Pure functions with no screen code: used by the live history map and by ":::graph" blocks.
 *
 * Example: main has A, B, E and "feature" forked from B with C, D:
 *
 *   lane 0:  A ── B ────── E      (main)
 *   lane 1:        └─ C ── D      (feature)
 */

/** What the layout needs to know about a commit. */
export type LaneCommit = { id: string; parentIds: string[] };

/** A commit's place on the grid; both numbers start at 0. */
export type LanePlace = { column: number; lane: number };

/** A run of commits that share a lane, and the columns it takes up there. */
type LaneSegment = { commitIds: string[]; firstColumn: number; lastColumn: number };

/**
 * Places every commit.
 * @param commits - the commits, in any order
 * @param tipIds - the newest commit of each line of work, most important first: the first tip
 *   and its ancestors get the top row
 * @returns each commit's column and lane, keyed by commit ID
 */
export function placeInLanes(commits: LaneCommit[], tipIds: string[]): Map<string, LanePlace> {
	const commitsById = new Map(commits.map((commit) => [commit.id, commit]));
	const columns = findColumns(commits, commitsById);
	const childColumns = findNewestChildColumns(commits, columns);
	const startIds = [...tipIds, ...newestFirst(commits, columns)];

	const lanes: LaneSegment[][] = [];
	const places = new Map<string, LanePlace>();
	for (const startId of startIds) {
		const segment = walkSegment(startId, commitsById, columns, childColumns, places);
		if (segment === null) {
			continue;
		}
		const lane = findFreeLane(lanes, segment);
		lanes[lane] = [...(lanes[lane] ?? []), segment];
		for (const commitId of segment.commitIds) {
			places.set(commitId, { column: columns.get(commitId) ?? 0, lane });
		}
	}
	return places;
}

/**
 * Finds each commit's column: one more than its furthest parent's, so a commit always sits
 * to the right of everything it was built on.
 * @param commits - the commits
 * @param commitsById - the same commits, by ID
 * @returns the column of every commit
 */
function findColumns(
	commits: LaneCommit[],
	commitsById: Map<string, LaneCommit>
): Map<string, number> {
	const columns = new Map<string, number>();
	for (const commit of commits) {
		// A stack instead of a function calling itself: a long history would overflow the call stack.
		const waiting = [commit.id];
		while (waiting.length > 0) {
			const commitId = waiting[waiting.length - 1];
			const knownParentIds = (commitsById.get(commitId)?.parentIds ?? []).filter((parentId) =>
				commitsById.has(parentId)
			);
			const unplacedParentIds = knownParentIds.filter((parentId) => !columns.has(parentId));
			if (columns.has(commitId) || unplacedParentIds.length === 0) {
				const parentColumns = knownParentIds.map((parentId) => columns.get(parentId) ?? 0);
				columns.set(commitId, parentColumns.length === 0 ? 0 : Math.max(...parentColumns) + 1);
				waiting.pop();
			} else {
				waiting.push(...unplacedParentIds);
			}
		}
	}
	return columns;
}

/**
 * For each commit, finds the column of its newest child (the commit furthest right that was
 * built on it). A track runs from a commit to each child, so the lane is taken until there.
 * @param commits - the commits
 * @param columns - every commit's column
 * @returns the newest child's column, for commits that have a child
 */
function findNewestChildColumns(
	commits: LaneCommit[],
	columns: Map<string, number>
): Map<string, number> {
	const childColumns = new Map<string, number>();
	for (const commit of commits) {
		const column = columns.get(commit.id) ?? 0;
		for (const parentId of commit.parentIds) {
			childColumns.set(parentId, Math.max(childColumns.get(parentId) ?? 0, column));
		}
	}
	return childColumns;
}

/**
 * Lists commit IDs from the newest column to the oldest, so commits no tip reaches still get
 * a lane, starting from their newest end.
 * @param commits - the commits
 * @param columns - every commit's column
 * @returns the IDs, newest first
 */
function newestFirst(commits: LaneCommit[], columns: Map<string, number>): string[] {
	return commits
		.map((commit) => commit.id)
		.sort((firstId, secondId) => (columns.get(secondId) ?? 0) - (columns.get(firstId) ?? 0));
}

/**
 * Walks back from a commit through first parents, collecting commits that have no lane yet.
 * It stops at a commit already placed: that is where this line of work forked off.
 * @param startId - the commit to start from
 * @param commitsById - the commits, by ID
 * @param columns - every commit's column
 * @param childColumns - the newest child's column, per commit
 * @param places - the commits placed so far
 * @returns the segment, or null when the start is unknown or already placed
 */
function walkSegment(
	startId: string,
	commitsById: Map<string, LaneCommit>,
	columns: Map<string, number>,
	childColumns: Map<string, number>,
	places: Map<string, LanePlace>
): LaneSegment | null {
	const commitIds: string[] = [];
	let currentId: string | undefined = startId;
	while (currentId !== undefined && commitsById.has(currentId) && !places.has(currentId)) {
		if (commitIds.includes(currentId)) {
			break;
		}
		commitIds.push(currentId);
		currentId = commitsById.get(currentId)?.parentIds[0];
	}
	if (commitIds.length === 0) {
		return null;
	}
	const tipColumn = columns.get(commitIds[0]) ?? 0;
	const oldestColumn = columns.get(commitIds[commitIds.length - 1]) ?? 0;
	// The track to a child on another lane leaves from here, so keep the lane until just before it.
	const reachColumn = (childColumns.get(commitIds[0]) ?? tipColumn) - 1;
	return { commitIds, firstColumn: oldestColumn, lastColumn: Math.max(tipColumn, reachColumn) };
}

/**
 * Finds the topmost lane where a segment fits without overlapping another one.
 * @param lanes - the segments already in each lane
 * @param segment - the segment to place
 * @returns the lane number
 */
function findFreeLane(lanes: LaneSegment[][], segment: LaneSegment): number {
	const fitsIn = (laneSegments: LaneSegment[]): boolean =>
		laneSegments.every(
			(placed) => segment.firstColumn > placed.lastColumn || segment.lastColumn < placed.firstColumn
		);
	const freeLane = lanes.findIndex(fitsIn);
	return freeLane === -1 ? lanes.length : freeLane;
}
