import "server-only";

import { getIngredientNames } from "@/features/ingredient/data/get-ingredient-names";
import { createRecipe } from "@/features/recipe/data/recipe-draft";
import type { RecipeData } from "@/features/recipe/schema";
import { Prisma } from "@/generated/prisma/client";
import { RecordNotFoundError } from "@/lib/action-result";
import { prisma } from "@/lib/db";

import { splitDescription } from "../lib/description";
import type { DishData } from "../schema";

/**
 * Adds a dish to the end of a section: a new recipe and the menu item that
 * presents it, both in one transaction.
 */
export async function writeNewDish(
	userId: string,
	sectionId: string,
	dish: DishData,
	recipe: RecipeData
): Promise<{ recipeId: string; itemId: string }> {
	return prisma.$transaction(async (tx) => {
		const section = await tx.section.findFirst({
			where: { id: sectionId, group: { menu: { userId } } },
			select: { id: true },
		});
		if (!section) throw new RecordNotFoundError("Section not found.");

		const catalog = await getIngredientNames(tx);
		const recipeId = await createRecipe(tx, userId, recipe, catalog);
		const description = dish.description
			? splitDescription(dish.description, null, catalog)
			: null;
		const item = await tx.menuItem.create({
			data: {
				sectionId,
				recipeId,
				name: dish.name,
				// DescriptionPart is an interface, which Prisma's Json type rejects.
				description:
					(description as Prisma.InputJsonValue | null) ?? Prisma.DbNull,
				price: null,
				position: await tx.menuItem.count({ where: { sectionId } }),
			},
		});
		return { recipeId, itemId: item.id };
	});
}
