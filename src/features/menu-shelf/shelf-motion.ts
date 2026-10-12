import type { Easing } from "motion/react";

/** Tuning for moving between books on the shelf. */
export const shelfMotion = {
	/** Sliding the row so a neighbour becomes the current book. */
	slide: {
		duration: 0.9,
		ease: [0.65, 0, 0.35, 1] as Easing,
		/**
		 * Peak tilt in degrees while sliding. Books hang from their top edge,
		 * so the bottom runs ahead in the direction of travel.
		 */
		tilt: 4,
		/** Delay in seconds between books, leading book first. */
		stagger: 0.03,
	},
};
