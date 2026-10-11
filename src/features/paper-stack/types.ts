import type { ReactNode } from "react";

/** Where a sheet sits: at the stack origin or shifted right and down. */
export type StackPosition = "base" | "offset";

export interface StackSheet {
	/** Short name used in the "bring to front" control, e.g. "menu". */
	label: string;
	content: ReactNode;
}
