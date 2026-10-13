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
	/** Turning the menu card over to its import side and back. */
	flip: {
		duration: 0.7,
		ease: [0.65, 0, 0.35, 1] as Easing,
		/** Distance of the eye from the card; smaller looks more dramatic. */
		perspective: "2000px",
	},
};

/** Tuning for dragging rows on the editor cards. */
export const editorDrag = {
	/** How far the pointer must move before a press becomes a drag, in px. */
	activationDistance: 6,
	/** Opacity of the row being dragged. */
	draggingOpacity: 0.6,
};
