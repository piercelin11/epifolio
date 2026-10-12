"use client";

import { animate, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { relativeSlot } from "../shelf-layout";
import { shelfMotion } from "../shelf-motion";

/**
 * Owns which book is current and animates moving to another one. Books are
 * placed by slot in CSS; when the current book changes, each book jumps to
 * its new slot and is animated back from where it was (FLIP), travelling one
 * slot with a tilt. A book that wraps round the loop slides off-screen in
 * the same direction as the others instead of crossing the screen. Calls
 * made mid-move are ignored.
 */
export function useMenuShelf(count: number) {
	const [current, setCurrent] = useState(0);
	const moving = useRef(false);
	const bookRefs = useRef<(HTMLElement | null)[]>([]);
	const reduceMotion = useReducedMotion();

	/** Makes a neighbour of the current book current. */
	async function goTo(next: number) {
		if (moving.current || next === current) return;
		if (reduceMotion) {
			setCurrent(next);
			return;
		}

		// +1 when the row moves left (the right neighbour opens), -1 otherwise.
		const step = Math.sign(relativeSlot(next, current, count));
		const books = bookRefs.current.flatMap((el, index) =>
			el ? [{ el, index }] : []
		);
		const before = books.map(({ el }) => el.getBoundingClientRect().left);

		moving.current = true;
		try {
			flushSync(() => setCurrent(next));
			const after = books.map(({ el }) => el.getBoundingClientRect().left);
			// The previous current book never wraps, so it measures one slot.
			const old = books.findIndex(({ index }) => index === current);
			const pitch = (before[old] - after[old]) / step;

			const { tilt, stagger, ...timing } = shelfMotion.slide;
			await Promise.all(
				books.map(({ el, index }, i) => {
					const from = before[i] - after[i];
					const to = from - step * pitch;
					// The book furthest along the direction of travel leads.
					const order = step * relativeSlot(index, next, count);
					return animate(
						el,
						{ x: [from, to], rotate: [0, step * tilt, 0] },
						{ ...timing, delay: Math.max(0, order + 1) * stagger }
					).then(() => animate(el, { x: 0 }, { duration: 0 }));
				})
			);
		} finally {
			moving.current = false;
		}
	}

	return { current, goTo, bookRefs };
}
