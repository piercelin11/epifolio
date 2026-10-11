"use client";

import { animate, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { swapMotion } from "../swap-motion";
import type { StackPosition } from "../types";

const positions: StackPosition[] = ["base", "offset"];

/** Distance that moves a sheet resting at `restTop` fully below the viewport. */
function exitDistance(restTop: number) {
	return window.innerHeight - restTop + swapMotion.exitMargin;
}

/**
 * Owns which sheet is in front and animates the swap: both sheets drop out
 * of view with a tilt, the order changes off-screen, and they rise back
 * upright to the same place. Calls made mid-swap are ignored.
 */
export function usePaperStack(initialFront: StackPosition = "base") {
	const [front, setFront] = useState(initialFront);
	const swapping = useRef(false);
	const sheetRefs = useRef<Record<StackPosition, HTMLDivElement | null>>({
		base: null,
		offset: null,
	});
	const reduceMotion = useReducedMotion();

	/** `onHidden` runs while the sheets are off-screen, before they rise. */
	async function swapTo(next: StackPosition, onHidden?: () => void) {
		if (swapping.current || next === front) return;

		if (reduceMotion) {
			onHidden?.();
			setFront(next);
			window.scrollTo({ top: 0, behavior: "instant" });
			return;
		}

		swapping.current = true;
		try {
			const sheets = positions.map((position) => ({
				position,
				el: sheetRefs.current[position]!,
			}));
			// The front sheet leaves first; the new back sheet rises first.
			const leaveOrder = (position: StackPosition) =>
				position === front ? 0 : 1;
			const riseOrder = (position: StackPosition) =>
				position === next ? 1 : 0;

			const docTops = sheets.map(
				({ el }) => el.getBoundingClientRect().top + window.scrollY
			);

			await Promise.all(
				sheets.map(({ position, el }, i) =>
					animate(
						el,
						{
							y: exitDistance(docTops[i] - window.scrollY),
							rotate: swapMotion.rotate[position].out,
						},
						{
							...swapMotion.out,
							delay: leaveOrder(position) * swapMotion.stagger,
						}
					)
				)
			);

			flushSync(() => {
				onHidden?.();
				setFront(next);
			});
			window.scrollTo({ top: 0, behavior: "instant" });

			await Promise.all(
				sheets.map(({ position, el }, i) =>
					animate(
						el,
						{
							y: [exitDistance(docTops[i]), 0],
							rotate: [swapMotion.rotate[position].in, 0],
						},
						{
							...swapMotion.in,
							delay: riseOrder(position) * swapMotion.stagger,
						}
					)
				)
			);
		} finally {
			swapping.current = false;
		}
	}

	return { front, swapTo, sheetRefs };
}

export type PaperStackController = ReturnType<typeof usePaperStack>;
