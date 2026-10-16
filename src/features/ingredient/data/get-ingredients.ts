import "server-only";

import { z } from "zod";

import { prisma } from "@/lib/db";
import {
	defaultLocale,
	type Locale,
	localizedTextSchema,
	readLocalizedText,
} from "@/lib/i18n/localized";

import type { Ingredient } from "../types";

const weightsSchema = z.record(z.string(), z.number());

/** The shared ingredient catalog. */
export async function getIngredients(
	locale: Locale = defaultLocale
): Promise<Ingredient[]> {
	const ingredients = await prisma.ingredient.findMany({
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
	});

	return ingredients.map((ingredient) => {
		const { priceAmount, priceQuantity, priceUnit } = ingredient;
		return {
			id: ingredient.id,
			name: readLocalizedText(ingredient.name, locale),
			names: localizedTextSchema.parse(ingredient.name),
			aliases: z.array(z.string()).parse(ingredient.aliases),
			image: ingredient.image ?? undefined,
			price:
				priceAmount !== null && priceUnit !== null
					? {
							amount: priceAmount,
							quantity: priceQuantity ?? 1,
							unit: priceUnit,
						}
					: undefined,
			nutrition: {
				calories: ingredient.calories,
				protein: ingredient.protein,
				carbs: ingredient.carbs,
				fat: ingredient.fat,
			},
			units: {
				defaultUnit: ingredient.defaultUnit ?? undefined,
				weights: weightsSchema.parse(ingredient.unitWeights),
				density: ingredient.density ?? undefined,
			},
		};
	});
}
