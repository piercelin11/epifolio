import type { LocalizedText } from "@/lib/i18n/localized";

// Presentation types for ingredients. An ingredient is reference data,
// shared by every recipe line and menu item that names it by id.

/** A price for an amount of the ingredient, e.g. 25 per 100 g. */
export interface IngredientPrice {
	amount: number;
	quantity: number;
	/** A unit id from src/features/recipe/units.ts. */
	unit: string;
}

/** Nutrition per 100 g: calories in kcal, the rest in grams. */
export interface Nutrition {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
}

/** Nutrition per 100 g as stored; a value nobody knows is null. */
export type NutritionValues = { [K in keyof Nutrition]: number | null };

/** What the ingredient's units weigh (ADR-0031). */
export interface IngredientUnits {
	/** The unit a line with an amount but no unit is read in. */
	defaultUnit?: string;
	/** Grams per count unit, e.g. { clove: 5 }. */
	weights: Record<string, number>;
	/** Grams per millilitre, for volume units. */
	density?: number;
}

export interface Ingredient {
	id: string;
	/** The name in the current locale. */
	name: string;
	/** Every locale's name, for editing. */
	names: LocalizedText;
	aliases: string[];
	/** Path of the photo under public/, e.g. /ingredients/garlic.webp. */
	image?: string;
	price?: IngredientPrice;
	nutrition: NutritionValues;
	units: IngredientUnits;
}

/** A catalog ingredient by its names, e.g. for choosing one in a list. */
export interface CatalogIngredient {
	id: string;
	name: LocalizedText;
	aliases: string[];
}
