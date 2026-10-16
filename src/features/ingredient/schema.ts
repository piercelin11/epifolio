import { z } from "zod";

import { countUnits, unitSchema } from "@/features/recipe/units";
import { requiredLocalizedText } from "@/lib/i18n/localized";
import type { PlainErrorKey } from "@/lib/i18n/messages";

// Ingredient drafts: an ingredient edited on its card, and the catalog
// changes that come with a new recipe (ADR-0025), ingredients to create and
// aliases to add, both written when the recipe is saved.

const nutritionValue = z.number().min(0).nullable();

/** A count unit, e.g. clove; only these have a weight per ingredient. */
export const countUnitSchema = z.enum(countUnits, {
	error: "unitInvalid" satisfies PlainErrorKey,
});

/** What the ingredient's units weigh (ADR-0031). */
const ingredientUnitsSchema = z.object({
	defaultUnit: unitSchema.nullable(),
	/** Grams in one of each count unit, each unit once. */
	weights: z
		.array(z.object({ unit: countUnitSchema, grams: z.number().positive() }))
		.refine(
			(weights) =>
				new Set(weights.map((weight) => weight.unit)).size === weights.length,
			{ message: "unitRepeated" satisfies PlainErrorKey }
		),
	/** Grams per millilitre. */
	density: z.number().positive().nullable(),
});

type IngredientUnitsData = z.output<typeof ingredientUnitsSchema>;

/** The unit data as the Ingredient table stores it. */
export function unitColumns(units: IngredientUnitsData) {
	return {
		defaultUnit: units.defaultUnit,
		unitWeights: Object.fromEntries(
			units.weights.map((weight) => [weight.unit, weight.grams])
		),
		density: units.density,
	};
}

/** "risotto rice" becomes "Risotto rice", like the rest of the catalog. */
const capitalized = (text: string) =>
	text.charAt(0).toLocaleUpperCase("en") + text.slice(1);

/** An ingredient to add to the catalog; recipe lines cite it by key. */
export const newIngredientDraftSchema = z.object({
	key: z.string().min(1),
	/** The English name starts with a capital, however it was typed. */
	name: requiredLocalizedText("newIngredientNeedsName").transform((name) =>
		name.en ? { ...name, en: capitalized(name.en) } : name
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

/** What the ingredient card's back sends to the server. */
export const ingredientDraftSchema = z.object({
	id: z.string().min(1),
	name: requiredLocalizedText("nameRequired"),
	aliases: z.array(z.string().trim().min(1)),
	/** A price for an amount, e.g. 25 per 100 g; null when there is none. */
	price: z
		.object({
			amount: z.number().min(0),
			quantity: z.number().positive(),
			unit: unitSchema,
		})
		.nullable(),
	/** Per 100 g: calories in kcal, the rest in grams. */
	nutrition: z.object({
		calories: nutritionValue,
		protein: nutritionValue,
		carbs: nutritionValue,
		fat: nutritionValue,
	}),
	units: ingredientUnitsSchema,
});

export type IngredientDraft = z.input<typeof ingredientDraftSchema>;
export type IngredientDraftData = z.output<typeof ingredientDraftSchema>;
