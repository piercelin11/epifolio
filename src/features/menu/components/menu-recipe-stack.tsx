"use client";

import { useState } from "react";

import { PaperSheet } from "@/features/paper-stack/components/paper-sheet";
import { PaperStack } from "@/features/paper-stack/components/paper-stack";
import { usePaperStack } from "@/features/paper-stack/hooks/use-paper-stack";
import { RecipeSheet } from "@/features/recipe/components/recipe-sheet";
import type { Recipe } from "@/features/recipe/types";

import type { Section } from "../types";
import { MenuSheet } from "./menu-sheet";

interface MenuRecipeStackProps {
	sections: Section[];
	recipes: Recipe[];
}

/** The menu sheet over the recipe sheet; picking an item swaps them. */
export function MenuRecipeStack({ sections, recipes }: MenuRecipeStackProps) {
	const stack = usePaperStack("base");
	const [recipeId, setRecipeId] = useState<string>();
	const recipe = recipes.find((r) => r.id === recipeId);

	return (
		<PaperStack
			stack={stack}
			base={{
				label: "menu",
				content: (
					<PaperSheet tone="paper">
						<MenuSheet
							sections={sections}
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
