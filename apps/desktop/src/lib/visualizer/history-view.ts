/**
 * history-view.ts
 * Decides what part of the history map to show after it changes. A short history is shown
 * whole. A long one would have to shrink until nothing is readable, so the view centers on
 * HEAD (and the faded "next commit" station after it) instead: after each commit, the newest
 * station is in view. With several branch rows, the view zooms out a little, down to a
 * limit, so the rows beside HEAD's stay visible.
 */

import { stationSize, type PlacedStation } from './history-layout';

/** Show every station, or center on one point at a set zoom. */
export type HistoryView =
	{ kind: 'fit-all' } | { kind: 'center'; x: number; y: number; zoom: number };

/** Below this zoom, station labels get too small to read. */
export const smallestReadableZoom = 0.7;

/** The zoom used when centering on HEAD, as long as every row fits at it. */
export const followZoom = 0.9;

/** The furthest the view zooms out to keep every branch row in sight while following HEAD. */
export const smallestFollowZoom = 0.55;

/** Space kept around the stations when fitting, as a share of the view (Svelte Flow's padding). */
const fitPadding = 0.15;

/** The box around some stations, in map pixels. */
type Bounds = { left: number; right: number; top: number; bottom: number };

/**
 * Chooses the view for a freshly drawn map.
 * @param stations - the placed stations
 * @param viewSize - the map area's width and height, in pixels
 * @returns "fit-all" when every station fits at a readable zoom, otherwise a center on HEAD
 */
export function chooseHistoryView(
	stations: PlacedStation[],
	viewSize: { width: number; height: number }
): HistoryView {
	if (stations.length === 0 || viewSize.width === 0 || viewSize.height === 0) {
		return { kind: 'fit-all' };
	}
	const allBounds = findBounds(stations);
	const usableShare = 1 - 2 * fitPadding;
	const widthFitZoom = (viewSize.width * usableShare) / (allBounds.right - allBounds.left);
	const heightFitZoom = (viewSize.height * usableShare) / (allBounds.bottom - allBounds.top);
	if (Math.min(widthFitZoom, heightFitZoom) >= smallestReadableZoom) {
		return { kind: 'fit-all' };
	}

	const focusStations = stations.filter(
		(station) => station.data.isHead || station.data.isNextCommit
	);
	const followed = focusStations.length > 0 ? focusStations : [stations[stations.length - 1]];
	const followedBounds = findBounds(followed);
	// When every row fits (zoomed out a little if needed), keep all rows in sight; otherwise
	// stay on HEAD's row at the smallest follow zoom.
	const doAllRowsFit = heightFitZoom >= smallestFollowZoom;
	const verticalBounds = doAllRowsFit ? allBounds : followedBounds;
	return {
		kind: 'center',
		x: (followedBounds.left + followedBounds.right) / 2,
		y: (verticalBounds.top + verticalBounds.bottom) / 2,
		zoom: Math.min(followZoom, Math.max(smallestFollowZoom, heightFitZoom))
	};
}

/**
 * Finds the box around a few stations.
 * @param stations - at least one placed station
 * @returns the box's edges, in map pixels
 */
function findBounds(stations: PlacedStation[]): Bounds {
	return {
		left: Math.min(...stations.map((station) => station.x)),
		right: Math.max(...stations.map((station) => station.x + stationSize.width)),
		top: Math.min(...stations.map((station) => station.y)),
		bottom: Math.max(...stations.map((station) => station.y + stationSize.height))
	};
}
