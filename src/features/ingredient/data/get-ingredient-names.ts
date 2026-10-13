import "server-only";

import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { localizedTextSchema } from "@/lib/i18n/localized";

import type { IngredientNames } from "../lib/match-ingredient";

/** Every name and alias of each catalog ingredient, for matching wording. */
export async function getIngredientNames(
	db: Prisma.TransactionClient
): Promise<IngredientNames[]> {
	const ingredients = await db.ingredient.findMany({
		select: { id: true, name: true, aliases: true },
	});
	return ingredients.map((ingredient) => ({
		id: ingredient.id,
		names: [
			...Object.values(localizedTextSchema.parse(ingredient.name)),
			...z.array(z.string()).parse(ingredient.aliases),
		].filter((name): name is string => Boolean(name)),
	}));
}
