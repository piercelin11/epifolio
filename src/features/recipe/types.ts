import type { Nutrition } from "@/features/ingredient/types";

// Presentation types for recipes. A recipe is functional data and stays
// separate from MenuItem, which only references it by id.

/** A single amount, or a range such as 80-100. */
export type Quantity = number | [number, number];

/** One line of a recipe's ingredient list. */
export interface RecipeIngredient {
	/** Steps cite the line by this id; also keys its ready state. */
	id: string;
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

/** A run of step text, optionally naming one of the recipe's lines. */
export interface StepPart {
	text: string;
	/** The ingredient line this run mentions, see RecipeIngredient.id. */
	lineId?: string;
}

export interface Step {
	/** The step's key action, e.g. "Emulsify"; shown above the text. */
	title?: string;
	/** Time the step takes, when its text states one (ADR-0034). */
	minutes?: number;
	text: StepPart[];
}

export interface StepGroup {
	label?: string;
	steps: Step[];
}

/** A worked-out value that may leave out lines it could not work out. */
export interface Estimate<T> {
	value: T;
	/** Some counted lines could not be worked out and are left out. */
	incomplete: boolean;
}

/** A recipe's ingredient cost and nutrition (ADR-0032). */
export interface RecipeTotals {
	/** True when the totals are per serving, false for the whole recipe. */
	perServing: boolean;
	cost?: Estimate<number>;
	nutrition?: Estimate<Nutrition>;
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
	/** Worked out from the ingredient catalog when the page loads. */
	totals?: RecipeTotals;
}

/** A paper filed in the recipe folder, opened and closed by its tab. */
export type FolderPanel = "instructions" | "nutrition";

/** What the cook has done with a recipe while the page is open. */
export interface RecipeProgress {
	/** Servings picked; the recipe's own when absent. */
	servings?: number;
	/** Ids of the ingredient lines that are ready. */
	checked: string[];
	/** Papers opened or closed; the rest follow `defaultPanels`. */
	panels?: Partial<Record<FolderPanel, boolean>>;
}
