import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CardStockProps {
	/** The face seen: the clip sits on the left of the front, the right of the back. */
	side: "front" | "back";
	className?: string;
	children: ReactNode;
}

/**
 * One face of the ingredient card: textured card stock of a fixed size, held
 * by a binder clip on its top edge. Both faces share the size, so the card
 * keeps its shape when it turns over.
 */
export function CardStock({ side, className, children }: CardStockProps) {
	return (
		<article
			data-ingredient-card
			className={cn(
				"bg-ingredient-card text-ingredient-card-foreground relative isolate flex h-(--ingredient-card-height) w-(--ingredient-card-width) flex-col p-(--ingredient-card-padding) shadow-lg",
				className
			)}
		>
			<div
				aria-hidden
				className="paper-texture pointer-events-none absolute inset-0"
			/>
			{/*
			 * The clip image is 263 by 240; its jaw starts at 0.56 of its width
			 * from the top, so lifting it by that much puts the jaw on the edge.
			 */}
			<div
				aria-hidden
				className={cn(
					"absolute top-[calc(var(--ingredient-card-clip-width)*-0.56)] z-10 aspect-240/263 w-(--ingredient-card-clip-width) bg-(image:--ingredient-card-clip) bg-contain bg-no-repeat",
					side === "front"
						? "left-(--ingredient-card-clip-left)"
						: "right-(--ingredient-card-clip-left)"
				)}
			/>
			{children}
		</article>
	);
}
