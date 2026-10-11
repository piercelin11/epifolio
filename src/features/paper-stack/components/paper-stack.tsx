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
 * Two sheets in their own scroll area, which fills the space it is given.
 * They share one grid cell, so they scroll together; each is as tall as its
 * content, at least the height of the area. Only the stacking order changes.
 */
export function PaperStack({
	stack,
	base,
	offset,
	onBringToFront,
}: PaperStackProps) {
	const { front, scrollRef, sheetRefs } = stack;
	const sheets: Record<StackPosition, StackSheet> = { base, offset };

	return (
		<div
			ref={scrollRef}
			className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
		>
			{/* Clipping keeps sheets that drop out of view from growing the scroll area */}
			<div className="flex justify-center overflow-clip pb-24">
				<div className="grid w-[calc(var(--paper-width)+var(--paper-offset-x))] items-start">
					{(["base", "offset"] as const).map((position) => {
						const inFront = front === position;
						return (
							<div
								key={position}
								ref={(el) => {
									sheetRefs.current[position] = el;
								}}
								className={cn(
									"relative col-start-1 row-start-1 flex min-h-[calc(100dvh-var(--header-height))] w-(--paper-width) flex-col",
									positionClasses[position],
									inFront && "z-10"
								)}
							>
								<div inert={!inFront} className="flex flex-1 flex-col">
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
			</div>
		</div>
	);
}
