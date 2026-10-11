import type { Easing } from "motion/react";

import type { StackPosition } from "./types";

interface SheetRotation {
	/** Angle in degrees at the lowest point, leaving the screen. */
	out: number;
	/** Angle in degrees the sheet rises from; it settles at 0. */
	in: number;
}

/** Tuning for swapping the front sheet: drop out, swap, rise back. */
export const swapMotion = {
	/** Extra distance in px below the viewport, so rotated corners clear it. */
	exitMargin: 160,
	out: { duration: 0.5, ease: [0.55, 0, 1, 0.45] as Easing },
	in: { duration: 0.7, ease: [0, 0.55, 0.45, 1] as Easing },
	/** Delay in seconds between the two sheets. */
	stagger: 0.08,
	rotate: {
		base: { out: -5, in: 4 },
		offset: { out: 7, in: -3 },
	} satisfies Record<StackPosition, SheetRotation>,
};
