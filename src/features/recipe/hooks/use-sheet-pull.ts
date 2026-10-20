"use client";

import {
	type MotionValue,
	useMotionValue,
	useReducedMotion,
	useSpring,
} from "motion/react";
import { useCallback, useEffect } from "react";

import { folderMotion } from "../folder-motion";

interface SheetPullOptions {
	/** Whether input pulls the sheet now. */
	enabled: boolean;
	/** Furthest the sheet can be pulled, in px. */
	max: number;
	/** How much of the sheet shows before it is pulled, in px; sizes a page key's step. */
	page: number;
	/** The element whose wheel and touch input pulls the sheet. */
	scope: () => HTMLElement | null;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

/** Keys a focused control or field handles itself. */
const ownsKeys = "input, textarea, select, button, a, [contenteditable]";

/**
 * How far the instruction sheet is pulled out of the folder, past the
 * height it shows at rest (ADR-0033). The wheel, touch drags and the
 * scrolling keys move it while enabled; nothing else on the stack scrolls.
 */
export function useSheetPull({ enabled, max, page, scope }: SheetPullOptions): {
	pull: MotionValue<number>;
	reset: () => number;
} {
	const reduceMotion = useReducedMotion();
	const target = useMotionValue(0);
	const smooth = useSpring(target, folderMotion.pull);
	const pull = reduceMotion ? target : smooth;

	// A shorter sheet, e.g. after the language changes, pulls out less.
	useEffect(() => {
		if (target.get() > max) target.set(max);
	}, [target, max]);

	useEffect(() => {
		const el = scope();
		if (!enabled || !el) return;
		const by = (delta: number) => target.set(clamp(target.get() + delta, max));

		const onWheel = (event: WheelEvent) => {
			// Pinch zoom arrives as a wheel event with the control key.
			if (event.ctrlKey) return;
			event.preventDefault();
			const unit =
				event.deltaMode === WheelEvent.DOM_DELTA_LINE
					? folderMotion.wheelLine
					: event.deltaMode === WheelEvent.DOM_DELTA_PAGE
						? page
						: 1;
			by(event.deltaY * unit);
		};

		let touchY: number | null = null;
		const onTouchStart = (event: TouchEvent) => {
			touchY = event.touches[0]?.clientY ?? null;
		};
		const onTouchMove = (event: TouchEvent) => {
			const y = event.touches[0]?.clientY;
			if (touchY === null || y === undefined) return;
			event.preventDefault();
			by(touchY - y);
			touchY = y;
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.defaultPrevented || event.altKey || event.ctrlKey) return;
			if (event.metaKey) return;
			const from = event.target as Element;
			if (from !== document.body && !el.contains(from)) return;
			if (from.closest(ownsKeys)) return;
			const pageStep = page * folderMotion.pageStep;
			const steps: Record<string, number> = {
				ArrowDown: folderMotion.arrowStep,
				ArrowUp: -folderMotion.arrowStep,
				PageDown: pageStep,
				PageUp: -pageStep,
				" ": event.shiftKey ? -pageStep : pageStep,
				Home: -max,
				End: max,
			};
			const step = steps[event.key];
			if (step === undefined) return;
			event.preventDefault();
			by(step);
		};

		el.addEventListener("wheel", onWheel, { passive: false });
		el.addEventListener("touchstart", onTouchStart, { passive: true });
		el.addEventListener("touchmove", onTouchMove, { passive: false });
		window.addEventListener("keydown", onKeyDown);
		return () => {
			el.removeEventListener("wheel", onWheel);
			el.removeEventListener("touchstart", onTouchStart);
			el.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [enabled, max, page, scope, target]);

	/** Drops the pull at once and returns how far the sheet was pulled. */
	const reset = useCallback(() => {
		const pulled = pull.get();
		target.jump(0);
		smooth.jump(0);
		return pulled;
	}, [pull, target, smooth]);

	return { pull, reset };
}
