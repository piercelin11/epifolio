import type { IngredientPrice } from "../types";

const priceFormat = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 2,
});
const nutrientFormats = [0, 1].map(
	(digits) => new Intl.NumberFormat("en-US", { maximumFractionDigits: digits })
);

/** Formats a price amount, e.g. 25 -> "$25". */
export function formatPriceAmount(price: IngredientPrice): string {
	return `$${priceFormat.format(price.amount)}`;
}

/**
 * Formats a nutrition value with its unit, e.g. 6.4 -> "6.4g"; `digits` is
 * the most decimal places shown, 0 or 1.
 */
export function formatNutrient(
	value: number,
	unit: string,
	digits: 0 | 1 = 1
): string {
	return `${nutrientFormats[digits].format(value)}${unit}`;
}
