import type { Easing } from "motion/react";

/** Tuning for editor cards rising over the book and sinking away. */
export const editorMotion = {
	/** How far below its resting place a card starts and ends. */
	travel: "100vh",
	enter: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as Easing },
	exit: { duration: 0.4, ease: [0.7, 0, 0.84, 0] as Easing },
	/** Tilt in degrees while out of view; the card settles at 0. */
	rotate: { enter: -4, exit: 3 },
	/** The scrim over the book fades with the card. */
	scrim: { duration: 0.3 },
};
