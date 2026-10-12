import type { Easing } from "motion/react";

/** Tuning for the ingredient card rising into view and sinking away. */
export const cardMotion = {
	/** How far below its resting place the card starts and ends. */
	travel: "100vh",
	enter: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as Easing },
	exit: { duration: 0.4, ease: [0.7, 0, 0.84, 0] as Easing },
	/** Tilt in degrees while out of view; the card settles at 0. */
	rotate: { enter: -6, exit: 4 },
};
