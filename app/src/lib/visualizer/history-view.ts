/**
 * history-view.ts
 * Decides what part of the history map to show after it changes. A short history is shown
 * whole. A long one would have to shrink until nothing is readable, so the view centers on
 * HEAD (and the faded "next commit" station after it) at a readable zoom instead: after each
 * commit, the newest station is in view.
 */

import { stationSize, type PlacedStation } from './history-layout';

/** Show every station, or center on one point at a set zoom. */
export type HistoryView =
	{ kind: 'fit-all' } | { kind: 'center'; x: number; y: number; zoom: number };

/** Below this zoom, station labels get too small to read. */
export const smallestReadableZoom = 0.7;

/** The zoom used when centering on HEAD. */
export const followZoom = 0.9;

/** Space kept around the stations when fitting, as a share of the view (Svelte Flow's padding). */
const fitPadding = 0.15;

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
	if (findFitZoom(stations, viewSize) >= smallestReadableZoom) {
		return { kind: 'fit-all' };
	}
	const focusStations = stations.filter(
		(station) => station.data.isHead || station.data.isNextCommit
	);
	const followed = focusStations.length > 0 ? focusStations : [stations[stations.length - 1]];
	const center = findCenter(followed);
	return { kind: 'center', x: center.x, y: center.y, zoom: followZoom };
}

/**
 * Works out the zoom at which every station would fit, with the usual padding.
 * @param stations - the placed stations
 * @param viewSize - the map area's size
 * @returns the zoom (1 = actual size)
 */
function findFitZoom(
	stations: PlacedStation[],
	viewSize: { width: number; height: number }
): number {
	const left = Math.min(...stations.map((station) => station.x));
	const right = Math.max(...stations.map((station) => station.x + stationSize.width));
	const top = Math.min(...stations.map((station) => station.y));
	const bottom = Math.max(...stations.map((station) => station.y + stationSize.height));
	const usableShare = 1 - 2 * fitPadding;
	return Math.min(
		(viewSize.width * usableShare) / (right - left),
		(viewSize.height * usableShare) / (bottom - top)
	);
}

/**
 * Finds the middle of a few stations' boxes.
 * @param stations - at least one placed station
 * @returns the center point, in map pixels
 */
function findCenter(stations: PlacedStation[]): { x: number; y: number } {
	const left = Math.min(...stations.map((station) => station.x));
	const right = Math.max(...stations.map((station) => station.x + stationSize.width));
	const top = Math.min(...stations.map((station) => station.y));
	const bottom = Math.max(...stations.map((station) => station.y + stationSize.height));
	return { x: (left + right) / 2, y: (top + bottom) / 2 };
}
