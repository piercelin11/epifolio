import "server-only";

import { z } from "zod";

import { localizedTextSchema } from "@/lib/i18n/localized";
import { prisma } from "@/lib/db";

import type { CatalogIngredient } from "../types";

/** Every catalog ingredient's names, for picking one by name. */
export async function getIngredientCatalog(): Promise<CatalogIngredient[]> {
	const ingredients = await prisma.ingredient.findMany({
		select: { id: true, name: true, aliases: true },
		orderBy: { createdAt: "asc" },
	});
	return ingredients.map((ingredient) => ({
		id: ingredient.id,
		name: localizedTextSchema.parse(ingredient.name),
		aliases: z.array(z.string()).parse(ingredient.aliases),
	}));
}
