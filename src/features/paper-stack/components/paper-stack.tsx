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
	/**
	 * When set, the stack is shown but not usable: it does not scroll, its
	 * content is inert, and clicking either sheet calls `onActivate`.
	 */
	inactive?: {
		/** Accessible name of the click target, e.g. "Open Dessert". */
		label: string;
		onActivate: () => void;
	};
	/** Both sheets take the fixed sheet height token and clip their content. */
	fixedHeight?: boolean;
}

const positionClasses: Record<StackPosition, string> = {
	base: "w-(--paper-base-width)",
	offset: "mt-(--paper-offset-y) ml-(--paper-inset-x) w-(--paper-width)",
};

/**
 * Two sheets in their own scroll area, which fills the space it is given.
 * The sheets start below the header band and scroll over whatever sits
 * there. They share one grid cell, so they scroll together; each is as tall
 * as its content, at least the height of the area below the header band.
 * Only the stacking order changes. The base sheet is centred; the offset
 * sheet starts inside its left edge and sticks out past its right edge,
 * lower down.
 */
export function PaperStack({
	stack,
	base,
	offset,
	onBringToFront,
	inactive,
	fixedHeight = false,
}: PaperStackProps) {
	const { front, scrollRef, sheetRefs } = stack;
	const sheets: Record<StackPosition, StackSheet> = { base, offset };

	return (
		<div
			ref={scrollRef}
			className={cn(
				"min-h-0 flex-1 overscroll-contain pt-(--header-height)",
				// An inactive stack is clipped by the screen edge and overlaps the
				// header band, so it must not catch clicks meant for the header.
				inactive && "pointer-events-none",
				// At a fixed height nothing scrolls, and the sheets may run past
				// the bottom of the area.
				fixedHeight
					? "overflow-visible"
					: inactive
						? "overflow-hidden"
						: "overflow-y-auto"
			)}
		>
			{/*
			 * Clipping keeps sheets that drop out of view from growing the scroll
			 * area. The left padding, matching the offset sheet's overhang on
			 * the right, centres the base sheet.
			 */}
			<div className="pointer-events-none relative flex justify-center overflow-clip pb-24">
				<div className="box-content grid w-[calc(var(--paper-base-width)+var(--paper-offset-x))] items-start pl-(--paper-offset-x)">
					{(["base", "offset"] as const).map((position) => {
						const inFront = front === position;
						return (
							<div
								key={position}
								data-paper-position={position}
								ref={(el) => {
									sheetRefs.current[position] = el;
								}}
								className={cn(
									"pointer-events-auto relative col-start-1 row-start-1 flex flex-col",
									fixedHeight
										? "h-(--paper-fixed-height) overflow-clip"
										: "min-h-[calc(100dvh-var(--header-height))]",
									positionClasses[position],
									inFront && "z-10"
								)}
							>
								<div
									inert={!!inactive || !inFront}
									className="flex flex-1 flex-col"
								>
									{sheets[position].content}
								</div>
								{inactive ? (
									<button
										type="button"
										aria-label={inactive.label}
										className="absolute inset-0 cursor-pointer"
										onClick={inactive.onActivate}
									/>
								) : (
									!inFront &&
									onBringToFront && (
										<button
											type="button"
											aria-label={`Show ${sheets[position].label}`}
											className="absolute inset-0 cursor-pointer"
											onClick={() => onBringToFront(position)}
										/>
									)
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
