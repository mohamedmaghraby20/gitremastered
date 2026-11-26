/**
 * layer-marks.ts
 * The row of layer marks on the "Pick up where you left off" card: which reading layers of a
 * lesson are read (✓), which one is next (→), and which come later.
 */

import { lessonLayerIds, type LessonLayerId } from '$lib/types/lesson';

/** How far the student is with one layer. */
export type LayerState = 'read' | 'next' | 'later';

/** One mark: the layer's number and name, and its state. */
export type LayerMark = { number: number; label: string; state: LayerState };

/** The names shown for each layer, as on the lesson's tabs. */
const layerLabels: Record<LessonLayerId, string> = {
	mustKnow: 'Must know',
	underTheHood: 'Under the hood',
	advanced: 'Advanced'
};

/**
 * Works out the mark for each layer.
 * @param furthestLayerId - the deepest layer opened, or undefined if the lesson was never read
 * @returns one mark per layer, in reading order
 */
export function findLayerMarks(furthestLayerId: LessonLayerId | undefined): LayerMark[] {
	const furthestIndex =
		furthestLayerId === undefined ? -1 : lessonLayerIds.indexOf(furthestLayerId);
	return lessonLayerIds.map((layerId, layerIndex) => ({
		number: layerIndex + 1,
		label: layerLabels[layerId],
		state: findLayerState(layerIndex, furthestIndex)
	}));
}

/**
 * Compares one layer's position with the furthest layer read.
 * @param layerIndex - the layer's position (0 = Must know)
 * @param furthestIndex - the furthest layer's position, or -1 if none was read
 * @returns "read", "next" or "later"
 */
function findLayerState(layerIndex: number, furthestIndex: number): LayerState {
	if (layerIndex <= furthestIndex) {
		return 'read';
	}
	if (layerIndex === furthestIndex + 1) {
		return 'next';
	}
	return 'later';
}
