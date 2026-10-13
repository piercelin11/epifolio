import {
	type IngredientNames,
	matchIngredient,
} from "@/features/ingredient/lib/match-ingredient";
import type {
	CatalogChanges,
	NewIngredientDraft,
} from "@/features/ingredient/schema";
import type { CatalogIngredient } from "@/features/ingredient/types";
import type { RecipeDraft } from "@/features/recipe/schema";
import {
	type Locale,
	type LocalizedText,
	localize,
	locales,
} from "@/lib/i18n/localized";

import type { ImportedRecipe } from "./to-draft";

// The ingredient card's model: one row per imported ingredient line, each
// deciding which catalog ingredient the line uses (ADR-0025). Pure, so the
// card only presents it.

/** What a row's line will be linked to. */
export type RowChoice =
	| { kind: "catalog"; ingredientId: string; addAlias: boolean }
	| { kind: "new"; key: string }
	| { kind: "none" };

/** How a row's choice relates to its wording, for the row's tag. */
export type RowStatus = "matched" | "alias" | "new" | "none";

export interface IngredientRow {
	/** Position of the line, "group:line". */
	id: string;
	/** The line's wording in the recipe. */
	wording: LocalizedText;
	/** Where the line sits, e.g. "Sauce · 2 tbsp". */
	where: string;
	choice: RowChoice;
}

export interface IngredientChoices {
	rows: IngredientRow[];
	/** New ingredients by key; rows choose them. */
	newIngredients: NewIngredientDraft[];
}

const toNames = (catalog: CatalogIngredient[]): IngredientNames[] =>
	catalog.map(({ id, name, aliases }) => ({
		id,
		names: [...Object.values(name), ...aliases].filter((n): n is string =>
			Boolean(n)
		),
	}));

/** True when some wording of the line already names the ingredient. */
function namesIngredient(
	wording: LocalizedText,
	ingredient: CatalogIngredient
): boolean {
	const names = toNames([ingredient]);
	return Object.values(wording).some(
		(text) => text && matchIngredient(text, names)
	);
}

export function rowStatus(
	row: IngredientRow,
	catalog: CatalogIngredient[]
): RowStatus {
	if (row.choice.kind !== "catalog") return row.choice.kind;
	const { ingredientId } = row.choice;
	const ingredient = catalog.find((i) => i.id === ingredientId);
	return ingredient && namesIngredient(row.wording, ingredient)
		? "matched"
		: "alias";
}

/** The rows for an import, with the model's choices. */
export function ingredientChoices(
	imported: ImportedRecipe,
	locale: Locale
): IngredientChoices {
	const rows = imported.recipe.ingredientGroups.flatMap((group, g) =>
		group.lines.map((line, i): IngredientRow => {
			const to = line.link?.to ?? { kind: "none" as const };
			const amount = [line.quantity, line.unit].filter(Boolean).join(" ");
			return {
				id: `${g}:${i}`,
				wording: line.name,
				where: [localize(group.label ?? {}, locale), amount]
					.filter(Boolean)
					.join(" · "),
				choice: to.kind === "catalog" ? { ...to, addAlias: true } : { ...to },
			};
		})
	);
	return { rows, newIngredients: imported.newIngredients };
}

/** True when every row already names its catalog ingredient. */
export function allMatched(
	choices: IngredientChoices,
	catalog: CatalogIngredient[]
): boolean {
	return choices.rows.every((row) => rowStatus(row, catalog) === "matched");
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

/**
 * The first problem with the new ingredients, by key: a blank name, or a
 * name the catalog or another new ingredient already has.
 */
export function newIngredientProblems(
	choices: IngredientChoices,
	catalog: CatalogIngredient[]
): Map<string, string> {
	const problems = new Map<string, string>();
	const names = toNames(catalog);
	for (const item of chosenNewIngredients(choices)) {
		const texts = locales
			.map((locale) => item.name[locale]?.trim())
			.filter((t): t is string => Boolean(t));
		if (texts.length === 0) {
			problems.set(item.key, "Enter a name.");
			continue;
		}
		const clash = texts.map((t) => matchIngredient(t, names)).find(Boolean);
		if (clash) {
			const existing = catalog.find((i) => i.id === clash);
			problems.set(
				item.key,
				`"${localize(existing?.name)}" is already in the catalog. Link to it instead.`
			);
			continue;
		}
		names.push({ id: item.key, names: texts });
	}
	return problems;
}

/**
 * The recipe with each line linked as its row chose, and the catalog
 * changes to save with it.
 */
export function applyChoices(
	recipe: RecipeDraft,
	choices: IngredientChoices,
	catalog: CatalogIngredient[]
): { recipe: RecipeDraft; catalog: CatalogChanges } {
	const byId = new Map(choices.rows.map((row) => [row.id, row]));
	const aliases: CatalogChanges["aliases"] = [];
	for (const row of choices.rows) {
		if (row.choice.kind !== "catalog" || !row.choice.addAlias) continue;
		if (rowStatus(row, catalog) !== "alias") continue;
		for (const text of new Set(Object.values(row.wording))) {
			if (text?.trim()) {
				aliases.push({ ingredientId: row.choice.ingredientId, alias: text });
			}
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
					const to =
						row.choice.kind === "catalog"
							? {
									kind: "catalog" as const,
									ingredientId: row.choice.ingredientId,
								}
							: row.choice;
					return { ...line, link: { to, name: line.name } };
				}),
			})),
		},
		catalog: { ingredients: chosenNewIngredients(choices), aliases },
	};
}
