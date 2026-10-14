import { z } from "zod";

import { requiredLocalizedText } from "@/lib/i18n/localized";

// Catalog changes that come with a new recipe (ADR-0025): ingredients to
// create and aliases to add, both written when the recipe is saved.

const nutritionValue = z.number().min(0).nullable();

/** "risotto rice" becomes "Risotto rice", like the rest of the catalog. */
const capitalized = (text: string) =>
	text.charAt(0).toLocaleUpperCase("en") + text.slice(1);

/** An ingredient to add to the catalog; recipe lines cite it by key. */
export const newIngredientDraftSchema = z.object({
	key: z.string().min(1),
	/** The English name starts with a capital, however it was typed. */
	name: requiredLocalizedText("Each new ingredient needs a name.").transform(
		(name) => (name.en ? { ...name, en: capitalized(name.en) } : name)
	),
	aliases: z.array(z.string().trim().min(1)),
	/** Per 100 g: calories in kcal, the rest in grams. */
	nutrition: z.object({
		calories: nutritionValue,
		protein: nutritionValue,
		carbs: nutritionValue,
		fat: nutritionValue,
	}),
	/** True while the nutrition is still the LLM's estimate. */
	nutritionEstimated: z.boolean(),
});

/** Another name for an existing ingredient, e.g. "Golden garlic". */
export const aliasDraftSchema = z.object({
	ingredientId: z.string().min(1),
	alias: z.string().trim().min(1),
});

export const catalogChangesSchema = z.object({
	ingredients: z.array(newIngredientDraftSchema),
	aliases: z.array(aliasDraftSchema),
});

export type NewIngredientDraft = z.input<typeof newIngredientDraftSchema>;
export type CatalogChanges = z.input<typeof catalogChangesSchema>;
export type CatalogChangesData = z.output<typeof catalogChangesSchema>;
