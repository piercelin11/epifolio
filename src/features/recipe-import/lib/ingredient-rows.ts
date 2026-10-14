import type {
	CatalogChanges,
	NewIngredientDraft,
} from "@/features/ingredient/schema";
import type { CatalogIngredient } from "@/features/ingredient/types";
import type { RecipeDraft } from "@/features/recipe/schema";
import { type LocalizedText, localize, locales } from "@/lib/i18n/localized";

import { wordingNamesIngredient } from "./match-catalog";
import type { FreshIngredient, ImportedRecipe } from "./to-draft";

// The ingredient review card's model: one row per imported food line, each
// either linking the line to a catalog ingredient or creating a new one.
// Aliases and nutrition are settled here, not by the cook (ADR-0025,
// ADR-0026). Pure, so the card only presents it.

/** What a row's line will be linked to; a link may still lack its pick. */
export type RowChoice =
	| { kind: "catalog"; ingredientId: string | null }
	| { kind: "new"; key: string };

export interface IngredientRow {
	/** Position of the line, "group:line". */
	id: string;
	/** The line's wording in the recipe. */
	wording: LocalizedText;
	choice: RowChoice;
	/** The import found the wording among an ingredient's names. */
	matched: boolean;
	/** Catalog ids that fit, best first, then loose resemblances. */
	suggestions: string[];
	/** The ingredient this row creates when it is set to Create new. */
	fresh: FreshIngredient;
	/** Key of that ingredient; rows naming the same one share it. */
	newKey: string;
}

export interface IngredientChoices {
	rows: IngredientRow[];
	/** New ingredients by key; rows choose them. */
	newIngredients: NewIngredientDraft[];
}

/** The rows for an import's food lines; lines that are not food stay unlinked. */
export function ingredientChoices(imported: ImportedRecipe): IngredientChoices {
	const rows = imported.recipe.ingredientGroups.flatMap((group, g) =>
		group.lines.flatMap((line, i): IngredientRow[] => {
			const id = `${g}:${i}`;
			const match = imported.matches[id];
			if (!match) return [];
			const to = line.link?.to;
			return [
				{
					id,
					wording: line.name,
					choice:
						to?.kind === "new"
							? to
							: {
									kind: "catalog",
									ingredientId: to?.kind === "catalog" ? to.ingredientId : null,
								},
					matched: match.status === "matched",
					suggestions: [...match.candidates, ...match.maybe],
					fresh: match.fresh,
					newKey: to?.kind === "new" ? to.key : `row:${id}`,
				},
			];
		})
	);
	return { rows, newIngredients: imported.newIngredients };
}

/** True when every food line already names its catalog ingredient. */
export function allMatched(choices: IngredientChoices): boolean {
	return choices.rows.every((row) => row.matched);
}

function updateRow(
	choices: IngredientChoices,
	rowId: string,
	choice: RowChoice
): IngredientChoices {
	return {
		...choices,
		rows: choices.rows.map((row) =>
			row.id === rowId ? { ...row, choice } : row
		),
	};
}

/** Links the row's line to a catalog ingredient (or clears the pick). */
export function linkRow(
	choices: IngredientChoices,
	rowId: string,
	ingredientId: string | null
): IngredientChoices {
	return updateRow(choices, rowId, { kind: "catalog", ingredientId });
}

/** Switches the row to Link to, picking its best suggestion. */
export function linkRowToSuggestion(
	choices: IngredientChoices,
	rowId: string
): IngredientChoices {
	const row = choices.rows.find((r) => r.id === rowId);
	return linkRow(choices, rowId, row?.suggestions[0] ?? null);
}

/** Switches the row to Create new, with the model's name and nutrition. */
export function createForRow(
	choices: IngredientChoices,
	rowId: string
): IngredientChoices {
	const row = choices.rows.find((r) => r.id === rowId);
	if (!row) return choices;
	const exists = choices.newIngredients.some((i) => i.key === row.newKey);
	const next = updateRow(choices, rowId, { kind: "new", key: row.newKey });
	return exists
		? next
		: {
				...next,
				newIngredients: [
					...next.newIngredients,
					{ key: row.newKey, ...row.fresh },
				],
			};
}

/** Renames a new ingredient in one locale. */
export function renameNew(
	choices: IngredientChoices,
	key: string,
	name: LocalizedText
): IngredientChoices {
	return {
		...choices,
		newIngredients: choices.newIngredients.map((item) =>
			item.key === key ? { ...item, name } : item
		),
	};
}

/** New ingredients some row still chooses. */
export function chosenNewIngredients(
	choices: IngredientChoices
): NewIngredientDraft[] {
	const keys = new Set(
		choices.rows.flatMap((row) =>
			row.choice.kind === "new" ? [row.choice.key] : []
		)
	);
	return choices.newIngredients.filter((item) => keys.has(item.key));
}

/** True when `text` is one of the ingredient's names or aliases. */
const names =
	(ingredient: { name: LocalizedText; aliases: string[] }) => (text: string) =>
		wordingNamesIngredient({ en: text }, { id: "", ...ingredient });

/**
 * What stops each row from being saved, by row id: a link with no pick, a
 * new ingredient with no name, or one named like an existing ingredient.
 */
export function rowProblems(
	choices: IngredientChoices,
	catalog: CatalogIngredient[]
): Map<string, string> {
	const byKey = new Map<string, string>();
	const taken: { id: string; name: LocalizedText; aliases: string[] }[] = [
		...catalog,
	];
	for (const item of chosenNewIngredients(choices)) {
		const texts = locales
			.map((locale) => item.name[locale]?.trim())
			.filter((t): t is string => Boolean(t));
		if (texts.length === 0) {
			byKey.set(item.key, "Enter a name.");
			continue;
		}
		const clash = taken.find((other) => texts.some(names(other)));
		if (clash) {
			byKey.set(
				item.key,
				`"${localize(clash.name)}" already exists. Link to it instead.`
			);
			continue;
		}
		taken.push({ id: item.key, name: item.name, aliases: [] });
	}

	const problems = new Map<string, string>();
	for (const row of choices.rows) {
		const { choice } = row;
		const problem =
			choice.kind === "catalog"
				? choice.ingredientId
					? undefined
					: "Pick an ingredient."
				: byKey.get(choice.key);
		if (problem) problems.set(row.id, problem);
	}
	return problems;
}

/**
 * The recipe with each line linked as its row chose, and the catalog
 * changes to save with it. A line linked to an ingredient whose names do
 * not include its wording teaches the catalog that wording as an alias.
 */
export function applyChoices(
	recipe: RecipeDraft,
	choices: IngredientChoices,
	catalog: CatalogIngredient[]
): { recipe: RecipeDraft; catalog: CatalogChanges } {
	const byId = new Map(choices.rows.map((row) => [row.id, row]));
	const aliases: CatalogChanges["aliases"] = [];
	const added = new Set<string>();
	for (const row of choices.rows) {
		const { choice } = row;
		if (choice.kind !== "catalog" || !choice.ingredientId) continue;
		const ingredient = catalog.find((i) => i.id === choice.ingredientId);
		if (!ingredient || wordingNamesIngredient(row.wording, ingredient))
			continue;
		for (const text of Object.values(row.wording)) {
			const alias = text?.trim();
			const id = `${choice.ingredientId}|${alias?.toLowerCase()}`;
			if (!alias || added.has(id)) continue;
			added.add(id);
			aliases.push({ ingredientId: choice.ingredientId, alias });
		}
	}
	return {
		recipe: {
			...recipe,
			ingredientGroups: recipe.ingredientGroups.map((group, g) => ({
				...group,
				lines: group.lines.map((line, i) => {
					const row = byId.get(`${g}:${i}`);
					if (!row) return line;
					const { choice } = row;
					const to =
						choice.kind === "new"
							? choice
							: choice.ingredientId
								? {
										kind: "catalog" as const,
										ingredientId: choice.ingredientId,
									}
								: { kind: "none" as const };
					return { ...line, link: { to, name: line.name } };
				}),
			})),
		},
		catalog: { ingredients: chosenNewIngredients(choices), aliases },
	};
}
