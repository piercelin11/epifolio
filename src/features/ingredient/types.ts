import type { LocalizedText } from "@/lib/i18n/localized";

// Presentation types for ingredients. An ingredient is reference data,
// shared by every recipe line and menu item that names it by id.

/** A price for a quantity of the ingredient, e.g. 25 per "100 g". */
export interface IngredientPrice {
	amount: number;
	unit: string;
}

/** Nutrition per 100 g: calories in kcal, the rest in grams. */
export interface Nutrition {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
}

export interface Ingredient {
	id: string;
	name: string;
	/** Path of the photo under public/, e.g. /ingredients/garlic.webp. */
	image?: string;
	price?: IngredientPrice;
	nutrition?: Nutrition;
}

/** A catalog ingredient by its names, e.g. for choosing one in a list. */
export interface CatalogIngredient {
	id: string;
	name: LocalizedText;
	aliases: string[];
}
