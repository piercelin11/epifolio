import type { IngredientPrice } from "../types";

const priceFormat = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 2,
});
const nutrientFormat = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 1,
});

/** Formats a price amount, e.g. 25 -> "$25". */
export function formatPriceAmount(price: IngredientPrice): string {
	return `$${priceFormat.format(price.amount)}`;
}

/** Formats a nutrition value with its unit, e.g. 6.4 -> "6.4g". */
export function formatNutrient(value: number, unit: string): string {
	return `${nutrientFormat.format(value)}${unit}`;
}
