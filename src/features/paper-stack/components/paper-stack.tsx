"use client";

import { cn } from "@/lib/utils";

import type { PaperStackController } from "../hooks/use-paper-stack";
import type { StackPosition, StackSheet } from "../types";

interface PaperStackProps {
	stack: PaperStackController;
	/** Sheet at the stack origin. */
	base: StackSheet;
	/** Sheet shifted right and down by the paper offset tokens. */
	offset: StackSheet;
	/** Called when the visible part of the back sheet is clicked. */
	onBringToFront?: (position: StackPosition) => void;
}

const positionClasses: Record<StackPosition, string> = {
	base: "",
	offset: "mt-(--paper-offset-y) ml-(--paper-offset-x)",
};

/**
 * Two sheets sharing one grid cell, so they scroll together and the stack
 * is as tall as the taller sheet. Only the stacking order ever changes.
 */
export function PaperStack({
	stack,
	base,
	offset,
	onBringToFront,
}: PaperStackProps) {
	const sheets: Record<StackPosition, StackSheet> = { base, offset };

	return (
		<div className="grid w-[calc(var(--paper-width)+var(--paper-offset-x))]">
			{(["base", "offset"] as const).map((position) => {
				const inFront = stack.front === position;
				return (
					<div
						key={position}
						ref={(el) => {
							stack.sheetRefs.current[position] = el;
						}}
						className={cn(
							"relative col-start-1 row-start-1 min-h-[calc(100dvh-var(--paper-top))] w-(--paper-width)",
							positionClasses[position],
							inFront && "z-10"
						)}
					>
						<div inert={!inFront} className="h-full">
							{sheets[position].content}
						</div>
						{!inFront && onBringToFront && (
							<button
								type="button"
								aria-label={`Show ${sheets[position].label}`}
								className="absolute inset-0 cursor-pointer"
								onClick={() => onBringToFront(position)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
