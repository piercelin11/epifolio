// Presentation types for recipes. A recipe is functional data and stays
// separate from MenuItem, which only references it by id.

export interface Ingredient {
	name: string;
	amount: string;
	note?: string;
}

export interface IngredientGroup {
	label: string;
	items: Ingredient[];
}

export interface Step {
	title: string;
	minutes?: number;
	text: string;
}

export interface Recipe {
	id: string;
	name: string;
	serves?: number;
	timeMinutes?: number;
	ingredientGroups: IngredientGroup[];
	steps: Step[];
	notes: string[];
}
