"use client";

import type { ComponentProps } from "react";

import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";
import { usePaperStack } from "@/features/paper-stack/hooks/use-paper-stack";
import type { StackPosition } from "@/features/paper-stack/types";
import { RecipeSheet } from "@/features/recipe/components/recipe-sheet";
import type { Recipe } from "@/features/recipe/types";
import { cn } from "@/lib/utils";

import type { MenuGroup } from "../types";
import { MenuSheet } from "./menu-sheet";

interface MenuRecipeStackProps {
	group: MenuGroup;
	recipes: Recipe[];
	chefName: string;
	/** Set on a book that is shown but not open; see PaperStack. */
	inactive?: ComponentProps<typeof PaperStack>["inactive"];
	/** Sheet in front; owned by the caller so it survives remounting. */
	front: StackPosition;
	onFrontChange: (front: StackPosition) => void;
	/** Recipe on the recipe sheet; defaults to the first item on the menu. */
	recipeId?: string;
	onRecipeChange: (recipeId: string) => void;
	/**
	 * Leave the recipe sheet blank while it is behind the menu. The text is
	 * hidden, not removed, so the sheet keeps its height.
	 */
	blankBackRecipe?: boolean;
}

/** The menu sheet over the recipe sheet; picking an item swaps them. */
export function MenuRecipeStack({
	group,
	recipes,
	chefName,
	inactive,
	front,
	onFrontChange,
	recipeId = group.sections[0]?.items[0]?.recipeId,
	onRecipeChange,
	blankBackRecipe = false,
}: MenuRecipeStackProps) {
	const stack = usePaperStack(front, onFrontChange);
	const recipe = recipes.find((r) => r.id === recipeId);

	return (
		<PaperStack
			stack={stack}
			inactive={inactive}
			base={{
				label: "menu",
				content: (
					<PaperSheet tone="paper">
						<MenuSheet
							group={group}
							chefName={chefName}
							onSelectItem={(item) =>
								stack.swapTo("offset", () => onRecipeChange(item.recipeId))
							}
						/>
					</PaperSheet>
				),
			}}
			offset={{
				label: "recipe",
				content: (
					<PaperSheet tone="primary" perforated>
						<div
							className={cn(blankBackRecipe && front === "base" && "invisible")}
						>
							<RecipeSheet recipe={recipe} />
						</div>
					</PaperSheet>
				),
			}}
			onBringToFront={(position) => {
				// The recipe sheet has nothing to show until an item is picked.
				if (position === "offset" && !recipe) return;
				stack.swapTo(position);
			}}
		/>
	);
}
