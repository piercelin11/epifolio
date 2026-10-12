// Presentation types for recipes. A recipe is functional data and stays
// separate from MenuItem, which only references it by id.

/** A single amount, or a range such as 80-100. */
export type Quantity = number | [number, number];

/** One line of a recipe's ingredient list. */
export interface RecipeIngredient {
	name: string;
	/** Absent for amounts such as "to taste". */
	quantity?: Quantity;
	unit?: string;
	note?: string;
	/** The ingredient this line uses; a reference, not a copy. */
	ingredientId?: string;
}

export interface IngredientGroup {
	label?: string;
	items: RecipeIngredient[];
}

export interface Step {
	title: string;
	minutes?: number;
	text: string;
}

export interface StepGroup {
	label?: string;
	steps: Step[];
}

export interface Recipe {
	id: string;
	name: string;
	/** Servings the quantities are written for. */
	serves?: number;
	timeMinutes?: number;
	ingredientGroups: IngredientGroup[];
	stepGroups: StepGroup[];
	notes: string[];
}

/** What the cook has done with a recipe while the page is open. */
export interface RecipeProgress {
	/** Servings picked; the recipe's own when absent. */
	servings?: number;
	/** Keys of the ingredient lines that are ready, see ingredientKey(). */
	checked: string[];
}
