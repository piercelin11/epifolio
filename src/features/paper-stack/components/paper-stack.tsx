"use client";

import type { ReactNode } from "react";

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
	/** Pinned to the top of the scroll area; the sheets scroll over it. */
	header?: ReactNode;
}

const positionClasses: Record<StackPosition, string> = {
	base: "ml-(--paper-overhang) w-(--paper-base-width)",
	offset: "mt-(--paper-offset-y) w-(--paper-width)",
};

/**
 * Two sheets in their own scroll area, which fills the space it is given.
 * They share one grid cell, so they scroll together; each is as tall as its
 * content, at least the height of the area below the header. Only the
 * stacking order changes. The base sheet is narrower and centred; the offset
 * sheet sticks out past it on the left, right and top.
 */
export function PaperStack({
	stack,
	base,
	offset,
	onBringToFront,
	header,
}: PaperStackProps) {
	const { front, scrollRef, sheetRefs } = stack;
	const sheets: Record<StackPosition, StackSheet> = { base, offset };

	return (
		<div
			ref={scrollRef}
			className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
		>
			{header && <div className="sticky top-0">{header}</div>}
			{/*
			 * Clipping keeps sheets that drop out of view from growing the scroll
			 * area. This layer covers the header once scrolled, so only the sheets
			 * take pointer input. The left padding centres the base sheet.
			 */}
			<div className="pointer-events-none relative z-10 flex justify-center overflow-clip pb-24">
				<div className="box-content grid w-(--paper-width) items-start pl-[calc(var(--paper-offset-x)-var(--paper-overhang))]">
					{(["base", "offset"] as const).map((position) => {
						const inFront = front === position;
						return (
							<div
								key={position}
								ref={(el) => {
									sheetRefs.current[position] = el;
								}}
								className={cn(
									"pointer-events-auto relative col-start-1 row-start-1 flex min-h-[calc(100dvh-var(--header-height))] flex-col",
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
