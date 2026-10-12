/**
 * Where book `index` sits relative to the current book, in book widths:
 * 0 is the centre, -1 the left neighbour, 1 the right one.
 *
 * Three or more books form a loop, so the last book sits left of the first;
 * the result is balanced around 0, with the extra book on the right when
 * the count is even. With two books there is no loop: the second book sits
 * right of the first, and the first left of the second.
 */
export function relativeSlot(index: number, current: number, count: number) {
	const distance = index - current;
	if (count < 3) return distance;
	const ahead = ((distance % count) + count) % count;
	return ahead > count / 2 ? ahead - count : ahead;
}

/** Whether a book at this slot shows in reading mode: the centre and its neighbours. */
export function isVisibleSlot(slot: number) {
	return Math.abs(slot) <= 1;
}

/**
 * Column of book `index` in the overview row, counted from the left edge:
 * the focused book sits in the second column, so the book before it shows
 * in the first. Three or more books loop like `relativeSlot`; a book whose
 * column is -1 sits just off the left edge.
 */
export function overviewColumn(index: number, focus: number, count: number) {
	if (count < 3) return 1 + index - focus;
	return (((index - focus + 1) % count) + count) % count;
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
