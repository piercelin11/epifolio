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
	chefName: string;
	/** Site header; the sheets scroll over it. */
	header?: ReactNode;
}

/** The menu sheet over the recipe sheet; picking an item swaps them. */
export function MenuRecipeStack({
	group,
	recipes,
	chefName,
	header,
}: MenuRecipeStackProps) {
	const stack = usePaperStack("base");
	// Until an item is picked, the recipe sheet shows the first one on the menu.
	const [recipeId, setRecipeId] = useState(
		() => group.sections[0]?.items[0]?.recipeId
	);
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
							chefName={chefName}
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
