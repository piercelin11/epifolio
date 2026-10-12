"use client";

import { useRef, useState } from "react";

interface OpenCard {
	ingredientId: string;
	/**
	 * The stack the card was picked in. Only that stack shows it, and it
	 * keeps showing it while the card sinks away after the stack closes.
	 */
	owner: string | number;
	/**
	 * Where the card is centred, in px from the top of the sheets' content:
	 * the middle of the screen when the card came up.
	 */
	top: number;
}

/** Middle of the visible part of `area`, measured from the top of its content. */
function screenMiddle(area: HTMLElement): number {
	const content = area.querySelector<HTMLElement>("[data-paper-content]");
	const areaTop = area.getBoundingClientRect().top;
	const contentTop = content?.getBoundingClientRect().top ?? areaTop;
	return areaTop + area.clientHeight / 2 - contentTop;
}

/**
 * Which ingredient card is up. Picking the same ingredient again puts it
 * away; picking another swaps it. Picks made mid-animation are ignored;
 * closing always goes through.
 */
export function useIngredientCard() {
	const [open, setOpen] = useState<OpenCard | null>(null);
	const busy = useRef(false);

	/** `scrollArea` is the area the sheets scroll in; the card scrolls with them. */
	function toggle(
		ingredientId: string,
		scrollArea: HTMLElement | null,
		owner: string | number
	) {
		if (busy.current || !scrollArea) return;
		busy.current = true;
		setOpen(
			open?.ingredientId === ingredientId
				? null
				: { ingredientId, owner, top: screenMiddle(scrollArea) }
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
