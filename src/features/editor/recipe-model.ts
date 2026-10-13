import type { RecipeDraft } from "@/features/recipe/schema";
import type { LocalizedText } from "@/lib/i18n/localized";

import { newKey } from "./keys";
import { flattenOutline, nestOutline, type OutlineRow } from "./outline";

// The recipe card's working copy: ingredients and steps as flat outlines.

type GroupDraft = RecipeDraft["ingredientGroups"][number];
type StepGroupDraft = RecipeDraft["stepGroups"][number];

export type LineEntry = Omit<GroupDraft["lines"][number], "id">;
export type StepEntry = Omit<StepGroupDraft["steps"][number], "id">;

export interface ReferenceRow {
	key: string;
	url: string;
}

export interface RecipeModel {
	id?: string;
	name: LocalizedText;
	serves: number | null;
	ingredients: OutlineRow<LineEntry>[];
	steps: OutlineRow<StepEntry>[];
	references: ReferenceRow[];
}

export const emptyLine = (): LineEntry => ({
	quantity: "",
	unit: "",
	name: {},
	note: {},
});

export const emptyStep = (): StepEntry => ({ title: {}, text: {} });

export function toRecipeModel(draft: RecipeDraft): RecipeModel {
	return {
		id: draft.id,
		name: draft.name,
		serves: draft.serves,
		ingredients: flattenOutline(
			draft.ingredientGroups.map((group) => ({
				id: group.id,
				label: group.label ?? {},
				entries: group.lines,
			}))
		),
		steps: flattenOutline(
			draft.stepGroups.map((group) => ({
				id: group.id,
				label: group.label ?? {},
				entries: group.steps,
			}))
		),
		references: draft.references.map((link) => ({
			key: newKey(),
			url: link.url,
		})),
	};
}

/** A blank recipe for a new dish, named after it. */
export function newRecipeModel(name: LocalizedText): RecipeModel {
	return {
		name,
		serves: null,
		ingredients: [{ kind: "group", key: newKey(), label: {} }],
		steps: [{ kind: "group", key: newKey(), label: {} }],
		references: [],
	};
}

export function toRecipeDraft(model: RecipeModel): RecipeDraft {
	return {
		id: model.id,
		name: model.name,
		serves: model.serves,
		ingredientGroups: nestOutline(model.ingredients).map((group) => ({
			id: group.id,
			label: group.label,
			lines: group.entries,
		})),
		stepGroups: nestOutline(model.steps).map((group) => ({
			id: group.id,
			label: group.label,
			steps: group.entries,
		})),
		references: model.references.map((row) => ({ url: row.url })),
	};
}
