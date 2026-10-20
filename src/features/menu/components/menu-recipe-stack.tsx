"use client";

import type { ComponentProps, ReactNode } from "react";

import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";
import { usePaperStack } from "@/features/paper-stack/hooks/use-paper-stack";
import type { StackPosition } from "@/features/paper-stack/types";
import { RecipeFolder } from "@/features/recipe/components/recipe-folder";
import type { Recipe, RecipeProgress } from "@/features/recipe/types";
import { useMessages } from "@/lib/i18n/locale-provider";

import type { MenuGroup } from "../types";
import { MenuSheet } from "./menu-sheet";

interface MenuRecipeStackProps {
	group: MenuGroup;
	recipes: Recipe[];
	/** Controls in the menu sheet's top-right corner. */
	menuActions?: ReactNode;
	/** Controls in the recipe folder's top-right corner, for the recipe shown. */
	recipeActions?: (recipeId: string) => ReactNode;
	/** Set on a book that is shown but not open; see PaperStack. */
	inactive?: ComponentProps<typeof PaperStack>["inactive"];
	/** Sheet in front; owned by the caller so it survives remounting. */
	front: StackPosition;
	onFrontChange: (front: StackPosition) => void;
	/** Recipe in the folder; defaults to the first item on the menu. */
	recipeId?: string;
	onRecipeChange: (recipeId: string) => void;
	/** Called with an ingredient picked on either sheet and the area the sheets scroll in. */
	onSelectIngredient?: (
		ingredientId: string,
		scrollArea: HTMLElement | null
	) => void;
	/** Laid over the sheets and scrolled with them; see PaperStack. */
	overlay?: ReactNode;
	/** Called as the sheets start to swap. */
	onSwapStart?: () => void;
	/** Servings, ready ingredients and open papers per recipe id; owned by the caller. */
	progress: Record<string, RecipeProgress>;
	onProgressChange: (recipeId: string, progress: RecipeProgress) => void;
	/**
	 * Leave the recipe folder blank while it is behind the menu. The text is
	 * hidden, not removed, so the papers keep their size.
	 */
	blankBackRecipe?: boolean;
}

/** The menu sheet over the recipe folder; picking an item swaps them. */
export function MenuRecipeStack({
	group,
	recipes,
	menuActions,
	recipeActions,
	inactive,
	front,
	onFrontChange,
	recipeId = group.sections[0]?.items[0]?.recipeId,
	onRecipeChange,
	onSelectIngredient,
	onSwapStart,
	overlay,
	progress,
	onProgressChange,
	blankBackRecipe = false,
}: MenuRecipeStackProps) {
	const t = useMessages();
	const stack = usePaperStack(front, onFrontChange);
	const recipe = recipes.find((r) => r.id === recipeId);
	const selectIngredient =
		onSelectIngredient &&
		((ingredientId: string) =>
			onSelectIngredient(ingredientId, stack.scrollRef.current));
	const swapTo: typeof stack.swapTo = (next, onHidden) => {
		if (next !== stack.front) onSwapStart?.();
		return stack.swapTo(next, onHidden);
	};

	return (
		<PaperStack
			stack={stack}
			inactive={inactive}
			overlay={overlay}
			base={{
				label: t.stack.showMenu,
				content: (
					<PaperSheet tone="paper">
						<MenuSheet
							group={group}
							actions={menuActions}
							onSelectItem={(item) =>
								swapTo("offset", () => onRecipeChange(item.recipeId))
							}
							onSelectIngredient={selectIngredient}
						/>
					</PaperSheet>
				),
			}}
			offset={{
				label: t.stack.showRecipe,
				render: (layer) => (
					<RecipeFolder
						recipe={recipe}
						actions={recipe && recipeActions?.(recipe.id)}
						progress={recipe && progress[recipe.id]}
						onSelectIngredient={selectIngredient}
						onProgressChange={(next) =>
							recipe && onProgressChange(recipe.id, next)
						}
						layer={layer}
						blank={blankBackRecipe && front === "base"}
					/>
				),
			}}
			onBringToFront={(position) => {
				// The folder has nothing to show until an item is picked.
				if (position === "offset" && !recipe) return;
				swapTo(position);
			}}
		/>
	);
}
