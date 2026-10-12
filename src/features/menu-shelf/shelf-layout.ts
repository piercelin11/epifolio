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
