import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StackPosition = "base" | "offset";

interface PaperStackProps {
	/** Sheet at the stack origin. */
	base: ReactNode;
	/** Sheet shifted right and down by the paper offset tokens. */
	offset: ReactNode;
	front: StackPosition;
}

/**
 * Two sheets sharing one grid cell, so they scroll together and the stack
 * is as tall as the taller sheet. Only the stacking order ever changes.
 */
export function PaperStack({ base, offset, front }: PaperStackProps) {
	return (
		<div className="grid w-[calc(var(--paper-width)+var(--paper-offset-x))]">
			<div
				className={cn(
					"col-start-1 row-start-1 min-h-[calc(100dvh-var(--paper-top))] w-(--paper-width)",
					front === "base" && "z-10"
				)}
			>
				{base}
			</div>
			<div
				className={cn(
					"col-start-1 row-start-1 mt-(--paper-offset-y) ml-(--paper-offset-x) min-h-[calc(100dvh-var(--paper-top))] w-(--paper-width)",
					front === "offset" && "z-10"
				)}
			>
				{offset}
			</div>
		</div>
	);
}
