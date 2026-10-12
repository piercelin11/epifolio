import "server-only";

import { prisma } from "@/lib/db";
import {
	defaultLocale,
	type Locale,
	readLocalizedText,
} from "@/lib/i18n/localized";

import type { Ingredient } from "../types";

/** The shared ingredient catalog. */
export async function getIngredients(
	locale: Locale = defaultLocale
): Promise<Ingredient[]> {
	const ingredients = await prisma.ingredient.findMany({
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});

	return ingredients.map((ingredient) => {
		const { priceAmount, priceUnit, calories, protein, carbs, fat } =
			ingredient;
		return {
			id: ingredient.id,
			name: readLocalizedText(ingredient.name, locale),
			image: ingredient.image ?? undefined,
			price:
				priceAmount !== null && priceUnit !== null
					? { amount: priceAmount, unit: priceUnit }
					: undefined,
			nutrition:
				calories !== null && protein !== null && carbs !== null && fat !== null
					? { calories, protein, carbs, fat }
					: undefined,
		};
	});
}
