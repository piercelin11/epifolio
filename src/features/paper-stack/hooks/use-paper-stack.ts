"use client";

import { animate, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { flushSync } from "react-dom";

import { swapMotion } from "../swap-motion";
import type { StackPosition } from "../types";

const positions: StackPosition[] = ["base", "offset"];

/**
 * Distance that moves a sheet fully below the visible part of the scroll
 * area, given the sheet's top relative to the area's top edge.
 */
function exitDistance(area: HTMLElement, topInView: number) {
	return area.clientHeight - topInView + swapMotion.exitMargin;
}

/**
 * Animates swapping the front sheet: both sheets drop out of view with a
 * tilt, the order changes off-screen, and they rise back upright to the same
 * place. Which sheet is in front is owned by the caller, so it can outlive
 * this stack. Calls made mid-swap are ignored.
 */
export function usePaperStack(
	front: StackPosition,
	setFront: (front: StackPosition) => void
) {
	const swapping = useRef(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const sheetRefs = useRef<Record<StackPosition, HTMLDivElement | null>>({
		base: null,
		offset: null,
	});
	const reduceMotion = useReducedMotion();

	/** `onHidden` runs while the sheets are off-screen, before they rise. */
	async function swapTo(next: StackPosition, onHidden?: () => void) {
		const area = scrollRef.current;
		if (!area || swapping.current || next === front) return;

		if (reduceMotion) {
			onHidden?.();
			setFront(next);
			area.scrollTo({ top: 0, behavior: "instant" });
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

			// Sheet tops within the scrolled content, independent of scroll position.
			const areaTop = area.getBoundingClientRect().top;
			const contentTops = sheets.map(
				({ el }) => el.getBoundingClientRect().top - areaTop + area.scrollTop
			);

			await Promise.all(
				sheets.map(({ position, el }, i) =>
					animate(
						el,
						{
							y: exitDistance(area, contentTops[i] - area.scrollTop),
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
			area.scrollTo({ top: 0, behavior: "instant" });

			await Promise.all(
				sheets.map(({ position, el }, i) =>
					animate(
						el,
						{
							y: [exitDistance(area, contentTops[i]), 0],
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

	return { front, swapTo, sheetRefs, scrollRef };
}

export type PaperStackController = ReturnType<typeof usePaperStack>;
