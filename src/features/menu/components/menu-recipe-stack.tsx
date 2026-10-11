"use client";

import { type ReactNode, useState } from "react";

import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";
import { usePaperStack } from "@/features/paper-stack/hooks/use-paper-stack";
import { RecipeSheet } from "@/features/recipe/components/recipe-sheet";
import type { Recipe } from "@/features/recipe/types";

import type { MenuGroup } from "../types";
import { MenuSheet } from "./menu-sheet";

interface MenuRecipeStackProps {
	group: MenuGroup;
	recipes: Recipe[];
	/** Site header; the sheets scroll over it. */
	header?: ReactNode;
}

/** The menu sheet over the recipe sheet; picking an item swaps them. */
export function MenuRecipeStack({
	group,
	recipes,
	header,
}: MenuRecipeStackProps) {
	const stack = usePaperStack("base");
	const [recipeId, setRecipeId] = useState<string>();
	const recipe = recipes.find((r) => r.id === recipeId);

	return (
		<PaperStack
			stack={stack}
			header={header}
			base={{
				label: "menu",
				content: (
					<PaperSheet tone="paper">
						<MenuSheet
							group={group}
							onSelectItem={(item) =>
								stack.swapTo("offset", () => setRecipeId(item.recipeId))
							}
						/>
					</PaperSheet>
				),
			}}
			offset={{
				label: "recipe",
				content: (
					<PaperSheet tone="primary" perforated>
						<RecipeSheet recipe={recipe} />
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
