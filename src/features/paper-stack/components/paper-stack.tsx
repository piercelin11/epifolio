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
}

const positionClasses: Record<StackPosition, string> = {
	base: "min-h-(--paper-base-min-height) w-(--paper-base-width)",
	offset:
		"mt-(--paper-offset-y) ml-(--paper-inset-x) min-h-(--paper-min-height) w-(--paper-width)",
};

/**
 * Two sheets in their own scroll area, which fills the space it is given.
 * The sheets start below the header band and scroll over whatever sits
 * there. They share one grid cell, so they scroll together; each is as tall
 * as its content, at least its minimum height token. The scroll bar is
 * hidden.
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
}: PaperStackProps) {
	const { front, scrollRef, sheetRefs } = stack;
	const sheets: Record<StackPosition, StackSheet> = { base, offset };

	return (
		<div
			ref={scrollRef}
			data-paper-scroll
			className={cn(
				// The bleed widens the area past the book on both sides without
				// moving the sheets; it scrolls only vertically.
				"-mx-(--paper-scroll-bleed) min-h-0 flex-1 scrollbar-none overscroll-contain px-(--paper-scroll-bleed) pt-(--header-height)",
				// An inactive stack is clipped by the screen edge and overlaps the
				// header band, so it must not catch clicks meant for the header.
				// It does not scroll either; its sheets may run past the bottom of
				// the area, but stay clipped at the top like a scrolled stack.
				inactive
					? "pointer-events-none overflow-visible [clip-path:inset(0_-100vw_-100vh)]"
					: "pointer-events-auto overflow-x-hidden overflow-y-auto"
			)}
		>
			{/*
			 * Clipping keeps sheets that drop out of view from growing the scroll
			 * area; only vertically, so tilted sheets can lean into the bleed. The
			 * left padding, matching the offset sheet's overhang on the right,
			 * centres the base sheet.
			 */}
			<div
				data-paper-content
				className="pointer-events-none relative flex justify-center overflow-x-visible overflow-y-clip pb-24"
			>
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
