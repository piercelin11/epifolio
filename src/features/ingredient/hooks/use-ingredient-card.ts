"use client";

import { useRef, useState } from "react";

interface OpenCard {
	ingredientId: string;
	/** Scroll area the card moves with once it is up. */
	scrollArea: HTMLElement | null;
}

/**
 * Which ingredient card is up. Picking the same ingredient again puts it
 * away; picking another swaps it. Picks made mid-animation are ignored;
 * closing always goes through.
 */
export function useIngredientCard() {
	const [open, setOpen] = useState<OpenCard | null>(null);
	const busy = useRef(false);

	function toggle(ingredientId: string, scrollArea: HTMLElement | null) {
		if (busy.current) return;
		busy.current = true;
		setOpen(
			open?.ingredientId === ingredientId ? null : { ingredientId, scrollArea }
		);
	}

	function close() {
		if (!open) return;
		busy.current = true;
		setOpen(null);
	}

	/** Called by the layer once an animation has finished. */
	function settle() {
		busy.current = false;
	}

	return { open, toggle, close, settle };
}

export type IngredientCardController = ReturnType<typeof useIngredientCard>;
