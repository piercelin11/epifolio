import { z } from "zod";

import { units } from "@/features/recipe/units";

// The shape the model must answer in (structured outputs, ADR-0022). Kept
// plain on purpose: no length or number limits, which structured outputs
// do not support; to-draft.ts checks the values instead.

/** Text in both locales; an empty string when there is none. */
const bilingual = z.object({ en: z.string(), zh: z.string() });

/** A run of step text; `line` is the ref of the ingredient line it names. */
const run = z.object({ text: z.string(), line: z.string().nullable() });

const line = z.object({
	/** Unique within the recipe, e.g. "L1"; steps cite the line by it. */
	ref: z.string(),
	/** "2", "1/2", "1 1/2", "80-100", or "" when the source gives no amount. */
	quantity: z.string(),
	unit: z.enum([...units, ""]),
	name: bilingual,
	note: bilingual,
	/** Catalog id, a new ingredient's key, or null for no ingredient. */
	ingredient: z.string().nullable(),
});

const step = z.object({
	title: bilingual,
	text: z.object({ en: z.array(run), zh: z.array(run) }),
});

const newIngredient = z.object({
	/** Unique within the answer, e.g. "N1". */
	key: z.string(),
	name: bilingual,
	aliases: z.array(z.string()),
	/** Per 100 g; null when unknown. */
	calories: z.number().nullable(),
	protein: z.number().nullable(),
	carbs: z.number().nullable(),
	fat: z.number().nullable(),
});

export const llmOutputSchema = z.object({
	/** False when the source holds no recipe. */
	isRecipe: z.boolean(),
	dish: z.object({
		name: bilingual,
		/** Short phrases for the menu, e.g. "Garlic", "Chilli oil". */
		description: z.object({ en: z.array(z.string()), zh: z.array(z.string()) }),
	}),
	recipe: z.object({
		name: bilingual,
		serves: z.number().nullable(),
		ingredientGroups: z.array(
			z.object({ label: bilingual, lines: z.array(line) })
		),
		stepGroups: z.array(z.object({ label: bilingual, steps: z.array(step) })),
		/** Web addresses the source itself gives. */
		references: z.array(z.string()),
	}),
	newIngredients: z.array(newIngredient),
});

export type LlmOutput = z.infer<typeof llmOutputSchema>;
