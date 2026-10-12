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
	/** Shrinking into the overview row and growing back out of it. */
	overview: {
		duration: 0.8,
		ease: [0.65, 0, 0.35, 1] as Easing,
		/** Delay in seconds between books, left to right. */
		stagger: 0.04,
		/**
		 * A book whose place in the row changes across the loop would cross
		 * the screen; it fades out and back in over these points in the move.
		 */
		wrapFade: [0, 0.25, 0.75, 1],
	},
	/** Moving the overview row one book per wheel or trackpad gesture. */
	step: {
		duration: 0.6,
		ease: [0.33, 1, 0.68, 1] as Easing,
		/** Distance in px a gesture must travel before the row moves. */
		threshold: 30,
	},
};
