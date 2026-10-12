"use client";

import {
	animate,
	type AnimationPlaybackControls,
	type Transition,
	useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { WheelGestures } from "wheel-gestures";

import {
	bookAt,
	loops,
	type OverviewGeometry,
	overviewColumn,
	overviewTransform,
	overviewWindow,
	readingWindow,
} from "../shelf-layout";
import { shelfMotion } from "../shelf-motion";

/**
 * `reading`: the current book is open in the centre. `overview`: every
 * book is shrunk into one row. `closing`: laid out for reading while the
 * books grow back from the row.
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

/** Measures the overview row from any book element. */
function measureOverview(
	root: HTMLElement,
	book: HTMLElement,
	count: number
): OverviewGeometry {
	const scale = parseFloat(
		getComputedStyle(root).getPropertyValue("--shelf-overview-scale")
	);
	const front = book.querySelector<HTMLElement>(
		'[data-paper-position="base"]'
	)!;
	const sheet = offsetWithin(front, book);
	const left = cssLength(root, "--shelf-overview-inset");
	// A book's visible width, from its menu sheet to its recipe sheet's edge.
	const width = scale * (book.offsetWidth - sheet.x);
	const pitch = width + scale * cssLength(root, "--shelf-overview-gap");
	// Centre books of the minimum height in the space below the header band;
	// longer ones run past the bottom.
	const height =
		scale *
		(cssLength(root, "--paper-offset-y") +
			cssLength(root, "--paper-min-height"));
	const viewport = root.clientWidth;
	return {
		scale,
		left,
		pitch,
		top: sheet.y + (root.clientHeight - sheet.y - height) / 2,
		sheetX: sheet.x,
		sheetY: sheet.y,
		columns: Math.ceil((viewport - left) / pitch),
		fits: left + (count - 1) * pitch + width <= viewport - left,
	};
}

/**
 * Turns a book's scroll position into an offset on its content and animates
 * that back to 0, so a move starts from what is on screen and the book ends
 * at the top.
 */
function settleScroll(book: HTMLElement, transition: Transition) {
	const area = book.querySelector<HTMLElement>("[data-paper-scroll]");
	const content = book.querySelector<HTMLElement>("[data-paper-content]");
	const top = area?.scrollTop ?? 0;
	if (!area || !content || top === 0) return;
	area.scrollTop = 0;
	return animate(content, { y: [-top, 0] }, transition);
}

/**
 * Owns the shelf: which position is in the centre, the reading and overview
 * phases, and the animations between them. Books are placed for reading by
 * slot in CSS; every move changes the slots and animates each book back from
 * where it was (FLIP). Calls made mid-animation are ignored.
 */
export function useMenuShelf(count: number) {
	const [phase, setPhase] = useState<ShelfPhase>("reading");
	/** Virtual position of the current book. */
	const [center, setCenter] = useState(0);
	/** Virtual position in the overview's second column. */
	const [focus, setFocus] = useState(0);
	const [geometry, setGeometry] = useState<OverviewGeometry | null>(null);
	const moving = useRef(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const bookRefs = useRef(new Map<number, HTMLElement>());
	/** Overview x offset per position, as last placed. */
	const overviewX = useRef(new Map<number, number>());
	const reduceMotion = useReducedMotion();

	const reading = readingWindow(center, count);
	const overview = geometry ? overviewWindow(focus, count, geometry) : [];
	/** Virtual positions to render, in order. */
	const positions =
		phase === "reading"
			? reading
			: phase === "overview"
				? overview
				: [...new Set([...overview, ...reading])].sort((a, b) => a - b);

	function books() {
		return [...bookRefs.current].map(([k, el]) => ({ k, el }));
	}

	async function run(task: () => Promise<unknown>) {
		if (moving.current) return;
		moving.current = true;
		try {
			await task();
		} finally {
			moving.current = false;
		}
	}

	const timing = (transition: Transition) =>
		reduceMotion ? { ...transition, duration: 0 } : transition;

	/** Makes a neighbouring position current. */
	function goTo(k: number) {
		if (phase !== "reading" || k === center) return;
		return run(async () => {
			const step = Math.sign(k - center);
			const { tilt, ...transition } = shelfMotion.slide;
			const old = bookRefs.current.get(center)!;
			const settling = settleScroll(old, timing(transition));
			const before = old.offsetLeft;
			flushSync(() => setCenter(k));
			// Every book moves by the same distance, so gaps stay even.
			const from = before - old.offsetLeft;
			await Promise.all([
				settling,
				...books().map(({ el }) =>
					animate(
						el,
						{ x: [from, 0], rotate: [0, step * tilt, 0] },
						timing(transition)
					)
				),
			]);
		});
	}

	/** Moves every rendered book to its overview column for `focusAt`. */
	function placeOverview(
		g: OverviewGeometry,
		focusAt: number,
		transition: Transition,
		stagger = 0
	) {
		return books().map(({ k, el }) => {
			const column = overviewColumn(k, focusAt);
			const target = overviewTransform(g, column, el.offsetLeft);
			overviewX.current.set(k, target.x);
			return animate(el, target, {
				...transition,
				delay: Math.max(0, column) * stagger,
			});
		});
	}

	/** Shrinks every book into the overview row. */
	function openOverview() {
		if (phase !== "reading") return;
		return run(async () => {
			const root = rootRef.current!;
			const current = bookRefs.current.get(center)!;
			const g = measureOverview(root, current, count);
			const { stagger, ...transition } = shelfMotion.overview;
			const settling = settleScroll(current, timing(transition));
			overviewX.current.clear();
			flushSync(() => {
				setGeometry(g);
				setFocus(center);
				setPhase("overview");
			});
			await Promise.all([
				settling,
				...placeOverview(g, center, timing(transition), stagger),
			]);
		});
	}

	/**
	 * Grows back to reading. `k` is the position picked; without one, the
	 * book that was open before the overview, in the column nearest the left.
	 */
	function closeOverview(k?: number) {
		if (phase !== "overview" || !geometry) return;
		const g = geometry;
		const book = bookAt(center, count);
		const next =
			k ??
			(loops(count)
				? focus - 1 + bookAt(book - bookAt(focus - 1, count), count)
				: center);

		return run(async () => {
			const before = new Map(books().map(({ k, el }) => [k, el.offsetLeft]));
			flushSync(() => {
				setCenter(next);
				setPhase("closing");
			});
			const { stagger, ...transition } = shelfMotion.overview;
			const animations: AnimationPlaybackControls[] = books().map(
				({ k, el }) => {
					const placed = overviewX.current.get(k);
					// A book that was not in the row fades in where it belongs.
					if (placed === undefined || !before.has(k)) {
						return animate(el, { opacity: [0, 1] }, timing(transition));
					}
					// Keep the book where it was while its slot changes underneath.
					const x = placed + before.get(k)! - el.offsetLeft;
					const column = overviewColumn(k, focus);
					return animate(
						el,
						{
							x: [x, 0],
							y: [g.top - g.scale * g.sheetY, 0],
							scale: [g.scale, 1],
						},
						{
							...timing(transition),
							delay: reduceMotion ? 0 : Math.max(0, column) * stagger,
						}
					);
				}
			);
			await Promise.all(animations);
			setPhase("reading");
		});
	}

	/** Moves the overview row one book; +1 brings the next book into focus. */
	function stepOverview(step: 1 | -1) {
		if (phase !== "overview" || !geometry || geometry.fits) return;
		const next = loops(count)
			? focus + step
			: Math.min(Math.max(focus + step, 0), count - 1);
		if (next === focus) return;
		const g = geometry;

		return run(async () => {
			flushSync(() => setFocus(next));
			// A book that just came into the row starts one column further out.
			for (const { k, el } of books()) {
				if (overviewX.current.has(k)) continue;
				const start = overviewTransform(
					g,
					overviewColumn(k, focus),
					el.offsetLeft
				);
				overviewX.current.set(k, start.x);
				animate(el, start, { duration: 0 });
			}
			const { duration, ease } = shelfMotion.step;
			await Promise.all(placeOverview(g, next, timing({ duration, ease })));
		});
	}

	// The wheel handler outlives renders; it always calls the latest step.
	const stepRef = useRef(stepOverview);
	useEffect(() => {
		stepRef.current = stepOverview;
	});

	// Forget overview offsets of books that left the row.
	useEffect(() => {
		for (const k of overviewX.current.keys()) {
			if (!bookRefs.current.has(k)) overviewX.current.delete(k);
		}
	});

	// In the overview, each wheel or trackpad gesture moves the row one book,
	// however far it travels; momentum after the step is ignored.
	const inOverview = phase === "overview";
	useEffect(() => {
		const root = rootRef.current;
		if (!inOverview || !root) return;
		const gestures = WheelGestures({ preventWheelAction: true });
		let stepped = false;
		gestures.observe(root);
		const off = gestures.on("wheel", (state) => {
			if (state.isStart) stepped = false;
			if (stepped || state.isEnding) return;
			// Movement is reversed: scrolling down or swiping left is negative.
			const [x, y] = state.axisMovement;
			const movement = Math.abs(y) >= Math.abs(x) ? y : x;
			if (Math.abs(movement) < shelfMotion.step.threshold) return;
			stepped = true;
			stepRef.current(movement < 0 ? 1 : -1);
		});
		return () => {
			off();
			gestures.disconnect();
		};
	}, [inOverview]);

	// The overview row is measured in px, so lay it out again on resize.
	useEffect(() => {
		if (!inOverview) return;
		const onResize = () => {
			if (moving.current) return;
			const any = bookRefs.current.values().next().value;
			if (!any) return;
			const g = measureOverview(rootRef.current!, any, count);
			flushSync(() => setGeometry(g));
			placeOverview(g, focus, { duration: 0 });
		};
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	});

	return {
		phase,
		center,
		focus,
		geometry,
		positions,
		goTo,
		openOverview,
		closeOverview,
		rootRef,
		bookRefs,
	};
}
