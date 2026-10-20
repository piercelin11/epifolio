import type { ReactNode } from "react";

/**
 * Where a sheet sits: `base` scrolls at the stack origin; `offset` is a
 * layer fixed over the whole stack (ADR-0033).
 */
export type StackPosition = "base" | "offset";

export interface StackSheet {
	/** Accessible name of the "bring to front" control, e.g. "Show menu". */
	label: string;
	content: ReactNode;
}

/** A click target that stands in for a layer's content while it is unusable. */
export interface StackCover {
	label: string;
	onActivate: () => void;
}

export interface StackLayerState {
	inFront: boolean;
	/**
	 * Set while the layer cannot be used (behind the other sheet, or the
	 * stack is inactive). The layer keeps its content inert and lays this
	 * over each surface it shows, so a click on them calls it.
	 */
	cover: StackCover | null;
}

export interface StackLayer {
	/** Accessible name of the "bring to front" control, e.g. "Show recipe". */
	label: string;
	/**
	 * The layer's content. The layer itself lets clicks through, so only the
	 * surfaces the content draws take pointer input.
	 */
	render: (state: StackLayerState) => ReactNode;
}
