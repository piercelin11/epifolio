import type { NewIngredientDraft } from "@/features/ingredient/schema";
import { descriptionSeparator, type DishDraft } from "@/features/menu/schema";
import { parseQuantity } from "@/features/recipe/lib/parse-quantity";
import type { RecipeDraft } from "@/features/recipe/schema";
import { scalingConfig } from "@/features/recipe/scaling";
import type { Localized, LocalizedText } from "@/lib/i18n/localized";

import type { LlmLineIngredient, LlmOutput } from "../llm-output";

// Turns the model's answer into the editor's drafts. The answer already has
// the right shape; this cleans its values so the drafts pass the same zod
// schemas as anything typed on the cards.

/** What an import hands to the ingredient and recipe cards. */
export interface ImportedRecipe {
	dish: DishDraft;
	recipe: RecipeDraft;
	/** Ingredients to create on save; recipe lines cite them by key. */
	newIngredients: NewIngredientDraft[];
}

interface Bilingual {
	en: string;
	zh: string;
}
type Line = RecipeDraft["ingredientGroups"][number]["lines"][number];
type Step = RecipeDraft["stepGroups"][number]["steps"][number];

/** Keeps the locales that have text. */
function localized(text: Bilingual): LocalizedText {
	const result: LocalizedText = {};
	if (text.en.trim()) result.en = text.en.trim();
	if (text.zh.trim()) result.zh = text.zh.trim();
	return result;
}

const isBlank = (text: LocalizedText) => Object.keys(text).length === 0;

const nameKey = (text: Bilingual) =>
	`${text.en.trim().toLowerCase()}|${text.zh.trim()}`;

const nutrient = (value: number | null) =>
	value !== null && Number.isFinite(value) && value >= 0 ? value : null;

function isWebAddress(text: string): boolean {
	try {
		const url = new URL(text);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

function servings(value: number | null): number | null {
	const { min, max } = scalingConfig.servings;
	return value !== null &&
		Number.isInteger(value) &&
		value >= min &&
		value <= max
		? value
		: null;
}

/**
 * The drafts for an answer, given the ids in the ingredient catalog. Throws
 * when the answer has no recipe in it.
 */
export function toImportedRecipe(
	output: LlmOutput,
	catalogIds: ReadonlySet<string>
): ImportedRecipe {
	if (!output.isRecipe) throw new Error("No recipe found.");

	// New ingredients by name; lines naming the same one share it.
	const created = new Map<string, NewIngredientDraft>();
	function newIngredient(
		ingredient: Extract<LlmLineIngredient, { kind: "new" }> | null,
		lineName: Bilingual
	): string {
		const source =
			ingredient && !isBlank(localized(ingredient.name))
				? ingredient.name
				: lineName;
		const id = nameKey(source);
		const same = created.get(id);
		const aliases = (ingredient?.aliases ?? [])
			.map((alias) => alias.trim())
			.filter(Boolean);
		if (same) {
			same.aliases = [...new Set([...same.aliases, ...aliases])];
			return same.key;
		}
		const nutrition = {
			calories: nutrient(ingredient?.calories ?? null),
			protein: nutrient(ingredient?.protein ?? null),
			carbs: nutrient(ingredient?.carbs ?? null),
			fat: nutrient(ingredient?.fat ?? null),
		};
		const key = `new-${created.size + 1}`;
		created.set(id, {
			key,
			name: localized(source),
			aliases: [...new Set(aliases)],
			nutrition,
			nutritionEstimated: Object.values(nutrition).some((v) => v !== null),
		});
		return key;
	}

	/**
	 * Where a line links. A catalog id the catalog lacks becomes a new
	 * ingredient named after the line, so it shows up for review instead
	 * of silently losing its ingredient.
	 */
	function linkTo(
		line: LlmOutput["recipe"]["ingredientGroups"][number]["lines"][number]
	) {
		const { ingredient } = line;
		switch (ingredient.kind) {
			case "catalog":
				return catalogIds.has(ingredient.id)
					? { kind: "catalog" as const, ingredientId: ingredient.id }
					: { kind: "new" as const, key: newIngredient(null, line.name) };
			case "new":
				return {
					kind: "new" as const,
					key: newIngredient(ingredient, line.name),
				};
			case "none":
				return { kind: "none" as const };
		}
	}

	const refs = new Set<string>();
	const ingredientGroups = output.recipe.ingredientGroups.map((group) => ({
		label: localized(group.label),
		lines: group.lines.flatMap((line): Line[] => {
			const name = localized(line.name);
			if (isBlank(name)) return [];
			const ref = line.ref.trim();
			const to = linkTo(line);
			const unique = ref && !refs.has(ref);
			if (unique) refs.add(ref);
			return [
				{
					...(unique ? { ref } : {}),
					quantity:
						parseQuantity(line.quantity) === undefined
							? ""
							: line.quantity.trim(),
					unit: line.unit,
					name,
					note: localized(line.note),
					link: { to, name },
				},
			];
		}),
	}));

	const stepGroups = output.recipe.stepGroups.map((group) => ({
		label: localized(group.label),
		steps: group.steps.flatMap((step): Step[] => {
			const parts: Localized<{ text: string; line?: string }[]> = {};
			const text: LocalizedText = {};
			for (const locale of ["en", "zh"] as const) {
				const runs = step.text[locale].filter((run) => run.text);
				const joined = runs.map((run) => run.text).join("");
				if (!joined.trim()) continue;
				text[locale] = joined;
				parts[locale] = runs.map(({ text, line }) =>
					line && refs.has(line) ? { text, line } : { text }
				);
			}
			if (isBlank(text)) return [];
			return [{ title: localized(step.title), text, parts }];
		}),
	}));

	const dishName = localized(output.dish.name);
	const recipeName = localized(output.recipe.name);
	const name = isBlank(recipeName) ? dishName : recipeName;
	if (isBlank(name)) throw new Error("The recipe has no name.");

	const description: LocalizedText = {};
	for (const locale of ["en", "zh"] as const) {
		const phrases = output.dish.description[locale]
			.map((phrase) => phrase.trim())
			.filter(Boolean);
		if (phrases.length > 0)
			description[locale] = phrases.join(descriptionSeparator);
	}

	return {
		dish: { name: isBlank(dishName) ? name : dishName, description },
		recipe: {
			name,
			serves: servings(output.recipe.serves),
			// The recipe card starts every list with a group.
			ingredientGroups:
				ingredientGroups.length > 0
					? ingredientGroups
					: [{ label: {}, lines: [] }],
			stepGroups:
				stepGroups.length > 0 ? stepGroups : [{ label: {}, steps: [] }],
			references: [
				...new Set(output.recipe.references.map((url) => url.trim())),
			]
				.filter(isWebAddress)
				.map((url) => ({ url })),
		},
		newIngredients: [...created.values()],
	};
}
