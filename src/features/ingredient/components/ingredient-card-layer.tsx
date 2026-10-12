"use client";

import {
	AnimatePresence,
	motion,
	type Transition,
	useMotionValue,
	useReducedMotion,
} from "motion/react";
import { type ReactNode, useEffect } from "react";

import { cardMotion } from "../card-motion";
import type { IngredientCardController } from "../hooks/use-ingredient-card";
import type { Ingredient } from "../types";
import { IngredientCard } from "./ingredient-card";

interface IngredientCardLayerProps {
	ingredients: Ingredient[];
	card: IngredientCardController;
}

/**
 * Keeps the card where it was when it came up, relative to the content of
 * `area`: scrolling the sheets moves the card with them, and scrolling over
 * the card scrolls the sheets.
 */
function FollowScroll({
	area,
	children,
}: {
	area: HTMLElement | null;
	children: ReactNode;
}) {
	const y = useMotionValue(0);
	useEffect(() => {
		if (!area) return;
		const start = area.scrollTop;
		const onScroll = () => y.set(start - area.scrollTop);
		area.addEventListener("scroll", onScroll, { passive: true });
		return () => area.removeEventListener("scroll", onScroll);
	}, [area, y]);

	return (
		<motion.div
			style={{ y }}
			onWheel={(event) => area?.scrollBy({ top: event.deltaY })}
		>
			{children}
		</motion.div>
	);
}

/**
 * Screen-wide layer over the shelf that holds the ingredient card. The card
 * comes up from below the screen to a place set by the screen, not by the
 * sheets, then moves with the sheets as they scroll. Escape or a click
 * anywhere but the card or an ingredient puts it away.
 */
export function IngredientCardLayer({
	ingredients,
	card,
}: IngredientCardLayerProps) {
	const { open, close, settle } = card;
	const ingredient =
		open && ingredients.find((item) => item.id === open.ingredientId);
	const reduceMotion = useReducedMotion();
	const timing = (transition: Transition) =>
		reduceMotion ? { ...transition, duration: 0 } : transition;

	useEffect(() => {
		if (!open) return;
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};
		const onPointerDown = (event: PointerEvent) => {
			const target = event.target as Element;
			if (target.closest("[data-ingredient-card], [data-ingredient-trigger]"))
				return;
			close();
		};
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("pointerdown", onPointerDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("pointerdown", onPointerDown);
		};
	}, [open, close]);

	return (
		<div className="pointer-events-none absolute inset-0 z-20 flex items-center-safe justify-end overflow-hidden pr-(--ingredient-card-right)">
			<AnimatePresence mode="wait" onExitComplete={settle}>
				{open && ingredient && (
					<FollowScroll key={open.ingredientId} area={open.scrollArea}>
						<motion.div
							className="pointer-events-auto"
							initial={{
								y: cardMotion.travel,
								rotate: cardMotion.rotate.enter,
							}}
							animate={{
								y: 0,
								rotate: 0,
								transition: timing(cardMotion.enter),
							}}
							exit={{
								y: cardMotion.travel,
								rotate: cardMotion.rotate.exit,
								transition: timing(cardMotion.exit),
							}}
							onAnimationComplete={settle}
						>
							<IngredientCard ingredient={ingredient} />
						</motion.div>
					</FollowScroll>
				)}
			</AnimatePresence>
		</div>
	);
}
