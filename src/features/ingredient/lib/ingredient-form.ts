import { z } from "zod";

import { countUnits, isUnit, unitSchema } from "@/features/recipe/units";
import { requiredLocalizedText } from "@/lib/i18n/localized";
import type { PlainErrorKey } from "@/lib/i18n/messages";

import { countUnitSchema, type IngredientDraft } from "../schema";
import type { Ingredient } from "../types";

// The ingredient card's back edits text fields; this turns them into a
// draft for the server, with a message key for each field it rejects.

const text = (value: number | null | undefined) =>
	value === null || value === undefined ? "" : String(value);

/** A stored unit as the form shows it: a unit from the list, or "". */
const unitValue = (unit: string | undefined) =>
	unit && isUnit(unit) ? unit : "";

const isCountUnit = (unit: string): unit is (typeof countUnits)[number] =>
	(countUnits as readonly string[]).includes(unit);

/** The form as it opens for `ingredient`. */
export function toFormValues(ingredient: Ingredient): IngredientFormValues {
	const { names, price, nutrition, units } = ingredient;
	return {
		name: { en: names.en ?? "", zh: names.zh ?? "" },
		price: {
			amount: text(price?.amount),
			quantity: price && price.quantity !== 1 ? text(price.quantity) : "",
			unit: unitValue(price?.unit),
		},
		nutrition: {
			calories: text(nutrition.calories),
			protein: text(nutrition.protein),
			carbs: text(nutrition.carbs),
			fat: text(nutrition.fat),
		},
		units: {
			defaultUnit: unitValue(units.defaultUnit),
			weights: Object.entries(units.weights).flatMap(([unit, grams]) =>
				isCountUnit(unit) ? [{ unit, grams: text(grams) }] : []
			),
			density: text(units.density),
		},
		aliases: ingredient.aliases.join(", "),
	};
}

/**
 * A number field: blank is null; anything else must be a number of at
 * least 0, or more than 0 when `positive`.
 */
const numberField = (positive = false) =>
	z
		.string()
		.trim()
		.transform((value, ctx) => {
			if (!value) return null;
			const number = Number(value);
			const message: PlainErrorKey | undefined = !Number.isFinite(number)
				? "numberInvalid"
				: positive && number <= 0
					? "positiveNumber"
					: number < 0
						? "numberInvalid"
						: undefined;
			if (message) {
				ctx.addIssue({ code: "custom", message });
				return z.NEVER;
			}
			return number;
		});

/** A unit picked from a list, or "" for none. */
const unitField = <T extends z.ZodType<string>>(unit: T) =>
	z.union([z.literal(""), unit]).transform((value) => value || null);

/** Turns the card's fields into a draft, without the ingredient's id. */
export const ingredientFormSchema = z
	.object({
		name: requiredLocalizedText("nameRequired"),
		price: z
			.object({
				amount: numberField(),
				quantity: numberField(true),
				unit: unitField(unitSchema),
			})
			.superRefine((price, ctx) => {
				const started = price.amount !== null || price.unit !== null;
				if (started && (price.amount === null || price.unit === null)) {
					ctx.addIssue({
						code: "custom",
						message: "priceNeedsUnit" satisfies PlainErrorKey,
						path: [price.amount === null ? "amount" : "unit"],
					});
				}
			})
			.transform((price) =>
				price.amount !== null && price.unit !== null
					? {
							amount: price.amount,
							quantity: price.quantity ?? 1,
							unit: price.unit,
						}
					: null
			),
		nutrition: z.object({
			calories: numberField(),
			protein: numberField(),
			carbs: numberField(),
			fat: numberField(),
		}),
		units: z.object({
			defaultUnit: unitField(unitSchema),
			weights: z
				.array(
					z.object({
						unit: unitField(countUnitSchema),
						grams: numberField(true),
					})
				)
				.transform((weights) =>
					// A row left blank is dropped rather than rejected.
					weights.flatMap(({ unit, grams }) =>
						unit && grams !== null ? [{ unit, grams }] : []
					)
				)
				.refine(
					(weights) =>
						new Set(weights.map((weight) => weight.unit)).size ===
						weights.length,
					{ message: "unitRepeated" satisfies PlainErrorKey }
				),
			density: numberField(true),
		}),
		aliases: z.string().transform((aliases) =>
			aliases
				.split(/[,，、]/)
				.map((alias) => alias.trim())
				.filter(Boolean)
		),
	})
	.transform((values): Omit<IngredientDraft, "id"> => values);

/** The card's fields: text as typed, units as picked. */
export type IngredientFormValues = z.input<typeof ingredientFormSchema>;
