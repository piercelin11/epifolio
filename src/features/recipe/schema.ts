import { z } from "zod";

import {
	localizedSchema,
	localizedTextSchema,
	optionalLocalizedTextSchema,
	requiredLocalizedText,
	requiredLocalizedTextSchema,
} from "@/lib/i18n/localized";
import type { PlainErrorKey } from "@/lib/i18n/messages";

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
			message: "quantityFormat" satisfies PlainErrorKey,
		});
		return z.NEVER;
	}
	return quantity;
});

/** Where a line's ingredient was decided, e.g. on the import's ingredient card. */
export const ingredientLinkSchema = z.discriminatedUnion("kind", [
	z.object({ kind: z.literal("catalog"), ingredientId: z.string().min(1) }),
	/** An ingredient created with the recipe, by its key (ADR-0025). */
	z.object({ kind: z.literal("new"), key: z.string().min(1) }),
	z.object({ kind: z.literal("none") }),
]);

export const ingredientLineDraftSchema = z.object({
	/** Absent for a line added in the editor; kept so steps can cite it. */
	id: z.string().min(1).optional(),
	/** A new line's stand-in for its id, so a step's parts can cite it. */
	ref: z.string().min(1).optional(),
	/**
	 * An explicit ingredient for the line, made for the wording in `name`.
	 * Once the line is renamed it is matched by name again.
	 */
	link: z
		.object({ to: ingredientLinkSchema, name: localizedTextSchema })
		.optional(),
	quantity: quantityFieldSchema,
	unit: z
		.union([unitSchema, z.literal("")], {
			error: "unitInvalid" satisfies PlainErrorKey,
		})
		.optional()
		.transform((unit) => unit || null),
	/** The recipe's wording, e.g. "Garlic, minced". */
	name: requiredLocalizedText("lineNeedsIngredient"),
	note: optionalLocalizedTextSchema,
});

export const ingredientGroupDraftSchema = z.object({
	id: z.string().min(1).optional(),
	label: optionalLocalizedTextSchema,
	lines: z.array(ingredientLineDraftSchema),
});

export const stepDraftSchema = z.object({
	id: z.string().min(1).optional(),
	/** The step's key action, e.g. "Emulsify". */
	title: optionalLocalizedTextSchema,
	text: requiredLocalizedText("stepNeedsText"),
	/**
	 * Time the step takes (ADR-0034). Carried through the recipe card,
	 * which does not edit it yet; null or absent for none.
	 */
	minutes: z.number().int().positive().nullable().optional(),
	/**
	 * The text split into runs citing lines by id or ref (ADR-0015). Used
	 * for a locale only while its runs still join up to its text.
	 */
	parts: localizedSchema(
		z.array(z.object({ text: z.string(), line: z.string().min(1).optional() }))
	).optional(),
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
		.pipe(z.url({ message: "urlInvalid" satisfies PlainErrorKey })),
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
	/**
	 * Tips that are not steps (ADR-0034). Carried through the recipe card,
	 * which does not edit them yet; absent leaves the saved notes as they are.
	 */
	notes: z.array(localizedTextSchema).optional(),
});

/** The editor's working copy; fields hold what was typed. */
export type RecipeDraft = z.input<typeof recipeDraftSchema>;
export type RecipeData = z.output<typeof recipeDraftSchema>;
