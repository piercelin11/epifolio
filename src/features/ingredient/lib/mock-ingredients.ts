import mockData from "@/features/menu/mock-data.json";

import type { Ingredient } from "../types";

/** Builds the ingredient catalog from mock data. */
export function getMockIngredients(
	ingredients: Ingredient[] = mockData.ingredients
): Ingredient[] {
	return ingredients;
}
