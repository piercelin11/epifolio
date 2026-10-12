"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import {
	type OverviewGeometry,
	overviewColumn,
	overviewTransform,
	relativeSlot,
} from "../shelf-layout";
import { shelfMotion } from "../shelf-motion";

/**
 * `reading`: the current book is open in the centre. `overview`: every
 * book is shrunk into one row. `closing`: laid out for reading but still
 * shown as previews while growing back.
 */
export type ShelfPhase = "reading" | "overview" | "closing";

/** Length of a CSS custom property in px, resolved against `root`. */
function cssLength(root: HTMLElement, name: string) {
	const probe = document.createElement("div");
	probe.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
	root.append(probe);
	const width = probe.getBoundingClientRect().width;
	probe.remove();
	return width;
}

/** Offset of `node` inside `ancestor`, ignoring transforms and scrolling. */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement) {
	let x = 0;
	let y = 0;
	let el: HTMLElement | null = node;
	while (el && el !== ancestor) {
		x += el.offsetLeft;
		y += el.offsetTop;
		el = el.offsetParent as HTMLElement | null;
	}
	return { x, y };
}

/** Measures the overview row from one book shown as a preview. */
function measureOverview(
	root: HTMLElement,
	book: HTMLElement
): OverviewGeometry {
	const scale = parseFloat(
		getComputedStyle(root).getPropertyValue("--shelf-overview-scale")
	);
	const front = book.querySelector<HTMLElement>(
		'[data-paper-position="base"]'
	)!;
	const back = book.querySelector<HTMLElement>(
		'[data-paper-position="offset"]'
	)!;
	const sheet = offsetWithin(front, book);
	const bottom = offsetWithin(back, book).y + back.offsetHeight;
	const gap = cssLength(root, "--shelf-overview-gap");
	// Centre the shrunk books in the space below the header band.
	const height = scale * (bottom - sheet.y);
	return {
		scale,
		left: cssLength(root, "--shelf-overview-inset"),
		pitch: scale * (book.offsetWidth - sheet.x + gap),
		top: sheet.y + (root.clientHeight - sheet.y - height) / 2,
		sheetX: sheet.x,
		sheetY: sheet.y,
	};
}

/**
 * Owns the shelf: which book is current, the reading and overview phases,
 * and the animations between them. Books are placed for reading by slot in
 * CSS; every move jumps them to their new place and animates them back
 * from where they were (FLIP). Calls made mid-animation are ignored.
 */
export function useMenuShelf(count: number) {
	const [phase, setPhase] = useState<ShelfPhase>("reading");
	const [current, setCurrent] = useState(0);
	/** Book in the overview's second column. */
	const [focus, setFocus] = useState(0);
	const moving = useRef(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const bookRefs = useRef<(HTMLElement | null)[]>([]);
	/** Overview x offset per book, as last placed. */
	const overviewX = useRef<number[]>([]);
	const geometry = useRef<OverviewGeometry | null>(null);
	const reduceMotion = useReducedMotion();

	function books() {
		return bookRefs.current.flatMap((el, index) => (el ? [{ el, index }] : []));
	}

	async function run(task: () => Promise<void>) {
		if (moving.current) return;
		moving.current = true;
		try {
			await task();
		} finally {
			moving.current = false;
		}
	}

	/** Makes a neighbour of the current book current. */
	function goTo(next: number) {
		if (phase !== "reading" || next === current) return;
		if (reduceMotion) {
			setCurrent(next);
			return;
		}

		return run(async () => {
			// +1 when the row moves left (the right neighbour opens), -1 otherwise.
			const step = Math.sign(relativeSlot(next, current, count));
			const all = books();
			const before = all.map(({ el }) => el.getBoundingClientRect().left);
			flushSync(() => setCurrent(next));
			const after = all.map(({ el }) => el.getBoundingClientRect().left);
			// The previous current book never wraps, so it measures one slot.
			const old = all.findIndex(({ index }) => index === current);
			const pitch = (before[old] - after[old]) / step;

			const { tilt, stagger, ...timing } = shelfMotion.slide;
			await Promise.all(
				all.map(({ el, index }, i) => {
					const from = before[i] - after[i];
					// A book that wraps round the loop keeps going off-screen.
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
		});
	}

	/** Places every book in its overview column for `focusIndex`. */
	function placeOverview(focusIndex: number, duration: number) {
		const root = rootRef.current!;
		const all = books();
		const reference = all.find(({ index }) => index === focusIndex)!.el;
		const g = measureOverview(root, reference);
		geometry.current = g;
		const { stagger, wrapFade, ...timing } = shelfMotion.overview;
		return Promise.all(
			all.map(({ el, index }) => {
				const column = overviewColumn(index, focusIndex, count);
				const target = overviewTransform(g, column, el.offsetLeft);
				const wraps = column - 1 !== relativeSlot(index, focusIndex, count);
				overviewX.current[index] = target.x;
				el.style.transformOrigin = "0 0";
				return animate(
					el,
					{ ...target, opacity: wraps && duration ? [1, 0, 0, 1] : 1 },
					{
						...timing,
						duration,
						delay: duration ? Math.max(0, column) * stagger : 0,
						opacity: { duration, times: wrapFade, ease: "linear" },
					}
				);
			})
		);
	}

	/** Shrinks every book into the overview row. */
	function openOverview() {
		if (phase !== "reading") return;
		return run(async () => {
			flushSync(() => {
				setPhase("overview");
				setFocus(current);
			});
			await placeOverview(
				current,
				reduceMotion ? 0 : shelfMotion.overview.duration
			);
		});
	}

	/** Grows back to reading with `next` as the current book. */
	function closeOverview(next = current) {
		if (phase !== "overview") return;
		return run(async () => {
			const g = geometry.current!;
			const all = books();
			const before = all.map(({ el }) => el.offsetLeft);
			flushSync(() => {
				setPhase("closing");
				setCurrent(next);
			});
			const { stagger, wrapFade, ...timing } = shelfMotion.overview;
			const duration = reduceMotion ? 0 : timing.duration;
			const nextColumn = overviewColumn(next, focus, count);
			await Promise.all(
				all.map(({ el, index }, i) => {
					// Keep the book where it was while its slot changes underneath.
					const x = overviewX.current[index] + before[i] - el.offsetLeft;
					const column = overviewColumn(index, focus, count);
					const wraps =
						column - nextColumn !== relativeSlot(index, next, count);
					return animate(
						el,
						{
							x: [x, 0],
							y: [g.top - g.scale * g.sheetY, 0],
							scale: [g.scale, 1],
							opacity: wraps && duration ? [1, 0, 0, 1] : 1,
						},
						{
							...timing,
							duration,
							delay: duration ? Math.max(0, column) * stagger : 0,
							opacity: { duration, times: wrapFade, ease: "linear" },
						}
					).then(() => {
						el.style.transformOrigin = "";
					});
				})
			);
			setPhase("reading");
		});
	}

	// The overview row is measured in px, so lay it out again on resize.
	useEffect(() => {
		if (phase !== "overview") return;
		const onResize = () => {
			if (!moving.current) placeOverview(focus, 0);
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	});

	return {
		phase,
		current,
		focus,
		goTo,
		openOverview,
		closeOverview,
		rootRef,
		bookRefs,
	};
}

export type MenuShelfController = ReturnType<typeof useMenuShelf>;
