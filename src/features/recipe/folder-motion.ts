import type { Easing } from "motion/react";

import type { FolderPanel } from "./types";

/** Papers that show when a recipe is first opened. */
export const defaultPanels: Record<FolderPanel, boolean> = {
	instructions: true,
	nutrition: false,
};

/** Tuning for the recipe folder's papers (ADR-0033); sizes are in globals.css. */
export const folderMotion = {
	/** Sliding a paper out of the folder or back in. */
	slide: { duration: 0.45, ease: [0.3, 0, 0.2, 1] as Easing },
	/**
	 * Pulling the instruction sheet also pushes the folder down: `share`
	 * of the pull moves the folder until it has sunk `depth` of its own
	 * height; after that only the sheet rises.
	 */
	sink: { share: 0.5, depth: 0.5 },
	/** Smooths pulling the instruction sheet; a mouse wheel moves in steps. */
	pull: { stiffness: 380, damping: 42, mass: 0.6 },
	/** px per line, for a wheel that reports lines rather than pixels. */
	wheelLine: 16,
	/** px per arrow key press. */
	arrowStep: 48,
	/** Share of the visible sheet that Page Up, Page Down and Space move. */
	pageStep: 0.85,
};
