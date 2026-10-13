import type { NewIngredientDraft } from "@/features/ingredient/schema";
import { descriptionSeparator, type DishDraft } from "@/features/menu/schema";
import { parseQuantity } from "@/features/recipe/lib/parse-quantity";
import type { RecipeDraft } from "@/features/recipe/schema";
import { scalingConfig } from "@/features/recipe/scaling";
import type { Localized, LocalizedText } from "@/lib/i18n/localized";

import type { LlmOutput } from "../llm-output";

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

	// New ingredients with a name; ones named alike are merged into the first.
	const keyFor = new Map<string, string>();
	const byName = new Map<string, NewIngredientDraft>();
	for (const item of output.newIngredients) {
		const name = localized(item.name);
		if (isBlank(name) || keyFor.has(item.key)) continue;
		const same = byName.get(nameKey(item.name));
		if (same) {
			keyFor.set(item.key, same.key);
			continue;
		}
		const nutrition = {
			calories: nutrient(item.calories),
			protein: nutrient(item.protein),
			carbs: nutrient(item.carbs),
			fat: nutrient(item.fat),
		};
		const ingredient: NewIngredientDraft = {
			key: item.key,
			name,
			aliases: [...new Set(item.aliases.map((a) => a.trim()).filter(Boolean))],
			nutrition,
			nutritionEstimated: Object.values(nutrition).some((v) => v !== null),
		};
		keyFor.set(item.key, item.key);
		byName.set(nameKey(item.name), ingredient);
	}

	const usedKeys = new Set<string>();
	const refs = new Set<string>();
	const ingredientGroups = output.recipe.ingredientGroups.map((group) => ({
		label: localized(group.label),
		lines: group.lines.flatMap((line): Line[] => {
			const name = localized(line.name);
			if (isBlank(name)) return [];
			const ref = line.ref.trim();
			const newKey = line.ingredient ? keyFor.get(line.ingredient) : undefined;
			const to =
				line.ingredient && catalogIds.has(line.ingredient)
					? { kind: "catalog" as const, ingredientId: line.ingredient }
					: newKey
						? { kind: "new" as const, key: newKey }
						: { kind: "none" as const };
			if (to.kind === "new") usedKeys.add(to.key);
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
		newIngredients: [...byName.values()].filter((item) =>
			usedKeys.has(item.key)
		),
	};
}
