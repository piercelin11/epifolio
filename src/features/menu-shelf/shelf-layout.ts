/*
 * The shelf places books by virtual position: an unbounded integer `k`, one
 * per place in the row. With three or more books the row loops, so position
 * `k` shows book `k mod count` and the same book can appear at more than one
 * position, as an infinite carousel does. Moving the row only changes which
 * position is in the centre; nothing jumps from one end to the other. With
 * fewer books there is no loop and position `k` is book `k`.
 */

/** Whether the row loops. */
export function loops(count: number) {
	return count >= 3;
}

/** Book shown at virtual position `k`. */
export function bookAt(k: number, count: number) {
	return loops(count) ? ((k % count) + count) % count : k;
}

function range(from: number, to: number) {
	return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}

/**
 * Positions rendered in reading mode around `center`: the centre, its
 * neighbours, and one more on each side so a book is always ready to slide
 * in from off-screen.
 */
export function readingWindow(center: number, count: number) {
	return loops(count) ? range(center - 2, center + 2) : range(0, count - 1);
}

/** Whether the position `slot` places from the centre shows in reading mode. */
export function isVisibleSlot(slot: number) {
	return Math.abs(slot) <= 1;
}

/**
 * Overview column of position `k`, counted from the left edge. The focused
 * position sits in the second column, so the one before it shows in the
 * first.
 */
export function overviewColumn(k: number, focus: number) {
	return k - focus + 1;
}

/**
 * Positions rendered in the overview. When every book fits on screen each
 * shows once and the row does not move; otherwise the visible columns plus
 * one spare on each side, so the row can slide either way.
 */
export function overviewWindow(
	focus: number,
	count: number,
	geometry: OverviewGeometry
) {
	if (!loops(count)) return range(0, count - 1);
	if (geometry.fits) return range(focus - 1, focus - 2 + count);
	return range(focus - 2, focus - 1 + geometry.columns);
}

/** Overview row metrics in px, measured from the rendered tokens. */
export interface OverviewGeometry {
	scale: number;
	/** Left edge of column 0. */
	left: number;
	/** Distance between columns. */
	pitch: number;
	/** Top edge of every book's menu sheet. */
	top: number;
	/** Menu sheet position inside an unscaled book element. */
	sheetX: number;
	sheetY: number;
	/** Columns at least partly on screen. */
	columns: number;
	/** Whether every book fits on screen at once. */
	fits: boolean;
}

/**
 * Transform that moves a book element, scaled from its top-left corner,
 * into an overview column. `elementLeft` is its untransformed left edge.
 */
export function overviewTransform(
	geometry: OverviewGeometry,
	column: number,
	elementLeft: number
) {
	const { scale, left, pitch, top, sheetX, sheetY } = geometry;
	return {
		x: left + column * pitch - scale * sheetX - elementLeft,
		y: top - scale * sheetY,
		scale,
	};
}
