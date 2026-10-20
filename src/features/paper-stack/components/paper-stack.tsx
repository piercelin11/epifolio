"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import type { PaperStackController } from "../hooks/use-paper-stack";
import type {
	StackCover,
	StackLayer,
	StackPosition,
	StackSheet,
} from "../types";

interface PaperStackProps {
	stack: PaperStackController;
	/** Sheet at the stack origin, in the scroll area. */
	base: StackSheet;
	/** Layer fixed over the whole stack; it does not scroll. */
	offset: StackLayer;
	/** Laid over the base sheet inside the scrolled content, e.g. a card. */
	overlay?: ReactNode;
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

// An inactive stack is clipped by the screen edge and overlaps the header
// band, so it must not catch clicks meant for the header. Its sheets may run
// past the bottom of the area, but stay clipped at the top like a scrolled
// stack.
const inactiveClip = "[clip-path:inset(0_-100vw_-100vh)]";

/**
 * A sheet in a scroll area with a layer fixed over it (ADR-0033). The area
 * fills the space it is given; the base sheet starts below the header band
 * and scrolls over whatever sits there, as tall as its content and at least
 * its minimum height token. The scroll bar is hidden. The layer fills the
 * stack and does not scroll; while it is in front the area is locked.
 * Only the stacking order changes. The base sheet is centred.
 */
export function PaperStack({
	stack,
	base,
	offset,
	overlay,
	onBringToFront,
	inactive,
}: PaperStackProps) {
	const { front, scrollRef, sheetRef } = stack;
	const baseInFront = front === "base";
	const layerInFront = front === "offset";
	const layerCover: StackCover | null = inactive
		? inactive
		: !layerInFront && onBringToFront
			? { label: offset.label, onActivate: () => onBringToFront("offset") }
			: null;

	return (
		<div data-paper-stack className="relative flex min-h-0 flex-1 flex-col">
			{/*
			 * Comes first, so the base sheet paints over it when neither is
			 * raised. It only raises itself in front, leaving the overlay above.
			 */}
			<div
				data-paper-position="offset"
				ref={sheetRef("offset")}
				className={cn(
					"pointer-events-none absolute inset-0",
					layerInFront && "z-10",
					inactive && inactiveClip
				)}
			>
				{offset.render({ inFront: layerInFront, cover: layerCover })}
			</div>
			<div
				ref={scrollRef}
				data-paper-scroll
				className={cn(
					// The bleed widens the area past the book on both sides without
					// moving the sheets; it scrolls only vertically.
					"-mx-(--paper-scroll-bleed) min-h-0 flex-1 scrollbar-none overscroll-contain px-(--paper-scroll-bleed) pt-(--header-height)",
					inactive
						? cn("pointer-events-none overflow-visible", inactiveClip)
						: "pointer-events-auto overflow-x-hidden",
					!inactive && (layerInFront ? "overflow-y-hidden" : "overflow-y-auto")
				)}
			>
				{/*
				 * Clipping keeps a sheet that drops out of view from growing the
				 * scroll area; only vertically, so a tilted sheet can lean into the
				 * bleed. The left padding, matching the folder's overhang on the
				 * right, centres the base sheet.
				 */}
				<div
					data-paper-content
					className="pointer-events-none relative flex justify-center overflow-x-visible overflow-y-clip pb-24"
				>
					<div className="box-content w-[calc(var(--paper-base-width)+var(--paper-offset-x))] pl-(--paper-offset-x)">
						<div
							data-paper-position="base"
							ref={sheetRef("base")}
							className={cn(
								"pointer-events-auto relative flex min-h-(--paper-base-min-height) w-(--paper-base-width) flex-col",
								baseInFront && "z-10"
							)}
						>
							<div
								inert={!!inactive || !baseInFront}
								className="flex flex-1 flex-col"
							>
								{base.content}
							</div>
							{inactive ? (
								<button
									type="button"
									aria-label={inactive.label}
									className="absolute inset-0 cursor-pointer"
									onClick={inactive.onActivate}
								/>
							) : (
								!baseInFront &&
								onBringToFront && (
									<button
										type="button"
										aria-label={base.label}
										className="absolute inset-0 cursor-pointer"
										onClick={() => onBringToFront("base")}
									/>
								)
							)}
						</div>
					</div>
					{overlay}
				</div>
			</div>
		</div>
	);
}
