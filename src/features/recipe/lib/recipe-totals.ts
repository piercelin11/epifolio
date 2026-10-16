import { amountUnit, convertAmount } from "@/features/ingredient/lib/convert";
import type { Ingredient, Nutrition } from "@/features/ingredient/types";

import type { Estimate, Quantity, Recipe, RecipeTotals } from "../types";

// A recipe's ingredient cost and nutrition (ADR-0032). Only lines that name
// an ingredient and have an amount count; a counted line that cannot be
// worked out makes the total incomplete.

const nutrients = ["calories", "protein", "carbs", "fat"] as const;

/** A single amount for a quantity: the middle of a range. */
function middle(quantity: Quantity): number {
	return typeof quantity === "number"
		? quantity
		: (quantity[0] + quantity[1]) / 2;
}

/** What one line adds; undefined where it cannot be worked out. */
function lineTotals(
	amount: number,
	unit: string | undefined,
	ingredient: Ingredient
): { cost?: number; nutrition?: Nutrition } {
	const { price, nutrition, units } = ingredient;
	const from = amountUnit(unit, units);

	let cost: number | undefined;
	if (price) {
		const priced = convertAmount(amount, from, price.unit, units);
		if (priced !== undefined) cost = (priced / price.quantity) * price.amount;
	}

	let lineNutrition: Nutrition | undefined;
	const grams = convertAmount(amount, from, "g", units);
	if (
		grams !== undefined &&
		nutrients.every((key) => nutrition[key] !== null)
	) {
		lineNutrition = {
			calories: (nutrition.calories! * grams) / 100,
			protein: (nutrition.protein! * grams) / 100,
			carbs: (nutrition.carbs! * grams) / 100,
			fat: (nutrition.fat! * grams) / 100,
		};
	}
	return { cost, nutrition: lineNutrition };
}

/**
 * The recipe's ingredient cost and nutrition per serving, or for the whole
 * recipe when it states no servings. A total no line contributes to is
 * left out.
 */
export function recipeTotals(
	recipe: Recipe,
	ingredients: ReadonlyMap<string, Ingredient>
): RecipeTotals {
	let cost = 0;
	let costLines = 0;
	let costMissing = false;
	const nutrition: Nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0 };
	let nutritionLines = 0;
	let nutritionMissing = false;

	for (const line of recipe.ingredientGroups.flatMap((group) => group.items)) {
		const ingredient = line.ingredientId
			? ingredients.get(line.ingredientId)
			: undefined;
		if (!ingredient || line.quantity === undefined) continue;
		const totals = lineTotals(middle(line.quantity), line.unit, ingredient);
		if (totals.cost === undefined) costMissing = true;
		else {
			cost += totals.cost;
			costLines++;
		}
		if (totals.nutrition === undefined) nutritionMissing = true;
		else {
			for (const key of nutrients) nutrition[key] += totals.nutrition[key];
			nutritionLines++;
		}
	}

	const servings = recipe.serves ?? 1;
	const estimate = <T>(value: T, incomplete: boolean): Estimate<T> => ({
		value,
		incomplete,
	});
	return {
		perServing: recipe.serves !== undefined,
		cost: costLines > 0 ? estimate(cost / servings, costMissing) : undefined,
		nutrition:
			nutritionLines > 0
				? estimate(
						{
							calories: nutrition.calories / servings,
							protein: nutrition.protein / servings,
							carbs: nutrition.carbs / servings,
							fat: nutrition.fat / servings,
						},
						nutritionMissing
					)
				: undefined,
	};
}
