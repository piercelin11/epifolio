import { z } from "zod";

import {
	optionalLocalizedTextSchema,
	requiredLocalizedText,
	requiredLocalizedTextSchema,
} from "@/lib/i18n/localized";

import { parseQuantity } from "./lib/parse-quantity";
import { scalingConfig } from "./scaling";
import { unitSchema } from "./units";

// What the recipe editor (and later the LLM import) sends to the server.

/** The Qty field as typed, read into a single amount or a range. */
export const quantityFieldSchema = z.string().transform((text, ctx) => {
	const quantity = parseQuantity(text);
	if (quantity === undefined) {
		ctx.addIssue({
			code: "custom",
			message: "Enter a number, a fraction or a range, e.g. 2, 1/2, 80-100.",
		});
		return z.NEVER;
	}
	return quantity;
});

export const ingredientLineDraftSchema = z.object({
	/** Absent for a line added in the editor; kept so steps can cite it. */
	id: z.string().min(1).optional(),
	quantity: quantityFieldSchema,
	unit: z
		.union([unitSchema, z.literal("")], {
			error: "Pick a unit from the list.",
		})
		.optional()
		.transform((unit) => unit || null),
	/** The recipe's wording, e.g. "Garlic, minced". */
	name: requiredLocalizedText("Each ingredient line needs an ingredient."),
	note: optionalLocalizedTextSchema,
});

export const ingredientGroupDraftSchema = z.object({
	id: z.string().min(1).optional(),
	label: optionalLocalizedTextSchema,
	lines: z.array(ingredientLineDraftSchema),
});

export const stepDraftSchema = z.object({
	id: z.string().min(1).optional(),
	/** Optional highlight, e.g. "Emulsify". */
	title: optionalLocalizedTextSchema,
	text: requiredLocalizedText("Each step needs an instruction."),
});

export const stepGroupDraftSchema = z.object({
	id: z.string().min(1).optional(),
	label: optionalLocalizedTextSchema,
	steps: z.array(stepDraftSchema),
});

export const referenceDraftSchema = z.object({
	url: z
		.string()
		.trim()
		.pipe(z.url({ message: "Enter a full web address." })),
});

/** One recipe as edited on the recipe card. */
export const recipeDraftSchema = z.object({
	/** Absent for a new recipe. */
	id: z.string().min(1).optional(),
	name: requiredLocalizedTextSchema,
	serves: z
		.number()
		.int()
		.min(scalingConfig.servings.min)
		.max(scalingConfig.servings.max)
		.nullable(),
	ingredientGroups: z.array(ingredientGroupDraftSchema),
	stepGroups: z.array(stepGroupDraftSchema),
	references: z.array(referenceDraftSchema),
});

/** The editor's working copy; fields hold what was typed. */
export type RecipeDraft = z.input<typeof recipeDraftSchema>;
export type RecipeData = z.output<typeof recipeDraftSchema>;
