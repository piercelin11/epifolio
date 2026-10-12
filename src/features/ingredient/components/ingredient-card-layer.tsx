"use client";

import {
	AnimatePresence,
	motion,
	type Transition,
	useReducedMotion,
} from "motion/react";
import { useEffect } from "react";

import { cardMotion } from "../card-motion";
import type { IngredientCardController } from "../hooks/use-ingredient-card";
import type { Ingredient } from "../types";
import { IngredientCard } from "./ingredient-card";

interface IngredientCardLayerProps {
	ingredients: Ingredient[];
	card: IngredientCardController;
	/** The stack this layer sits in; it shows only cards picked there. */
	owner: string | number;
}

/**
 * Holds the ingredient card inside the sheets' content, so it scrolls with
 * them natively. Every stack has a layer, so a stack that closes still
 * plays the card's exit. The card comes up from below the screen to a place set by
 * the screen when it was picked, not by the sheets. Escape or a click
 * anywhere but the card or an ingredient puts it away.
 */
export function IngredientCardLayer({
	ingredients,
	card,
	owner,
}: IngredientCardLayerProps) {
	const { close, settle } = card;
	const open = card.open?.owner === owner ? card.open : null;
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
		<AnimatePresence mode="wait" onExitComplete={settle}>
			{open && ingredient && (
				// The content is centred on screen, so measuring from its right edge
				// keeps the card's distance from the screen's right edge.
				<div
					key={open.ingredientId}
					className="pointer-events-auto absolute right-[calc(var(--ingredient-card-right)-(100vw-var(--shelf-book-width))/2)] z-20 -translate-y-1/2"
					style={{ top: open.top }}
				>
					<motion.div
						initial={{ y: cardMotion.travel, rotate: cardMotion.rotate.enter }}
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
				</div>
			)}
		</AnimatePresence>
	);
}
