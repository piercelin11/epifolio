import type { NewIngredientDraft } from "@/features/ingredient/schema";
import type { CatalogIngredient } from "@/features/ingredient/types";
import { descriptionSeparator, type DishDraft } from "@/features/menu/schema";
import { parseQuantity } from "@/features/recipe/lib/parse-quantity";
import type { RecipeDraft } from "@/features/recipe/schema";
import { scalingConfig } from "@/features/recipe/scaling";
import type { Localized, LocalizedText } from "@/lib/i18n/localized";

import type { LlmLineIngredient, LlmOutput } from "../llm-output";
import { type LineMatch, matchLine, normalize } from "./match-catalog";

// Turns the model's answer into the editor's drafts. The answer already has
// the right shape; this cleans its values so the drafts pass the same zod
// schemas as anything typed on the cards.

/** What an import hands to the ingredient and recipe cards. */
export interface ImportedRecipe {
	dish: DishDraft;
	recipe: RecipeDraft;
	/** Ingredients to create on save; recipe lines cite them by key. */
	newIngredients: NewIngredientDraft[];
	/**
	 * How each food line was found in the catalog, by "group:line" (the
	 * line's position in the recipe draft). Lines that are not food have none.
	 */
	matches: Record<string, ImportedMatch>;
}

/** A new ingredient as the model described it, before it gets a key. */
export type FreshIngredient = Omit<NewIngredientDraft, "key">;

/** A food line's catalog match, and the ingredient to create instead. */
export type ImportedMatch = LineMatch & { fresh: FreshIngredient };

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

/** A step's minutes as whole minutes, or null when the model gave none that make sense. */
function stepMinutes(minutes: number | null): number | null {
	if (minutes === null || !Number.isFinite(minutes)) return null;
	const whole = Math.round(minutes);
	return whole > 0 ? whole : null;
}

const nameKey = (text: Bilingual) =>
	`${text.en.trim().toLowerCase()}|${text.zh.trim()}`;

/** Drops repeats that differ only in case, width or punctuation. */
function unique(texts: string[]): string[] {
	const seen = new Set<string>();
	return texts.filter((text) => {
		const key = normalize(text);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

const nutrient = (value: number | null) =>
	value !== null && Number.isFinite(value) && value >= 0 ? value : null;

const positive = (value: number | null) =>
	value !== null && Number.isFinite(value) && value > 0 ? value : null;

/** The model's unit data, without unusable numbers or repeated units. */
function unitData(food: LlmFood): FreshIngredient["units"] {
	const seen = new Set<string>();
	const weights = food.unitWeights.flatMap(({ unit, grams }) => {
		const value = positive(grams);
		if (value === null || seen.has(unit)) return [];
		seen.add(unit);
		return [{ unit, grams: value }];
	});
	return {
		defaultUnit: food.defaultUnit || null,
		weights,
		density: positive(food.density),
	};
}

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

type LlmLine = LlmOutput["recipe"]["ingredientGroups"][number]["lines"][number];
type LlmFood = Extract<LlmLineIngredient, { kind: "food" }>;

/** The whole wording and the part before its first comma, per locale. */
const wordingNames = (wording: LocalizedText) =>
	Object.values(wording).flatMap((text) =>
		text ? [text, text.split(/[,，]/)[0].trim()] : []
	);

/**
 * The drafts for an answer, with each food line matched to the catalog in
 * code (ADR-0026). Throws when the answer has no recipe in it. `warn`
 * hears about anything dropped on the way.
 */
export function toImportedRecipe(
	output: LlmOutput,
	catalog: CatalogIngredient[],
	warn: (message: string) => void = () => {}
): ImportedRecipe {
	if (!output.isRecipe) throw new Error("No recipe found.");

	/**
	 * The ingredient a food line would create: the model's name (else the
	 * wording), its other names and the wording as aliases, and its
	 * estimated nutrition.
	 */
	function freshIngredient(
		food: LlmFood,
		wording: LocalizedText
	): FreshIngredient {
		const named = localized(food.name);
		const name = isBlank(named) ? wording : named;
		const taken = new Set(Object.values(name).map((n) => normalize(n ?? "")));
		const aliases = [...food.terms, ...wordingNames(wording)]
			.map((alias) => alias.trim())
			.filter((alias) => alias && !taken.has(normalize(alias)));
		const nutrition = {
			calories: nutrient(food.calories),
			protein: nutrient(food.protein),
			carbs: nutrient(food.carbs),
			fat: nutrient(food.fat),
		};
		const units = unitData(food);
		return {
			name,
			aliases: unique(aliases),
			nutrition,
			nutritionEstimated: Object.values(nutrition).some((v) => v !== null),
			units,
			unitsEstimated:
				units.defaultUnit !== null ||
				units.weights.length > 0 ||
				units.density !== null,
		};
	}

	// New ingredients by name; lines naming the same one share it.
	const created = new Map<string, NewIngredientDraft>();
	function newIngredient(fresh: FreshIngredient): string {
		const id = nameKey({ en: fresh.name.en ?? "", zh: fresh.name.zh ?? "" });
		const same = created.get(id);
		if (same) {
			same.aliases = unique([...same.aliases, ...fresh.aliases]);
			// Lines may weigh different units, e.g. cloves and a head of garlic.
			const known = new Set(same.units.weights.map((weight) => weight.unit));
			same.units = {
				...same.units,
				weights: [
					...same.units.weights,
					...fresh.units.weights.filter((weight) => !known.has(weight.unit)),
				],
			};
			return same.key;
		}
		const key = `new-${created.size + 1}`;
		created.set(id, { key, ...fresh });
		return key;
	}

	const matches: Record<string, ImportedMatch> = {};
	/** Where a line links: its best catalog candidate, a new ingredient, or none. */
	function linkTo(line: LlmLine, wording: LocalizedText, position: string) {
		const { ingredient } = line;
		if (ingredient.kind === "none") return { kind: "none" as const };
		const match = matchLine(
			{ wording, name: localized(ingredient.name), terms: ingredient.terms },
			catalog
		);
		const fresh = freshIngredient(ingredient, wording);
		matches[position] = { ...match, fresh };
		return match.status === "new"
			? { kind: "new" as const, key: newIngredient(fresh) }
			: { kind: "catalog" as const, ingredientId: match.candidates[0] };
	}

	const refs = new Set<string>();
	const ingredientGroups = output.recipe.ingredientGroups.map((group, g) => {
		const lines: Line[] = [];
		for (const line of group.lines) {
			const name = localized(line.name);
			if (isBlank(name)) {
				warn(`Dropped an ingredient line with no name (${line.ref}).`);
				continue;
			}
			const ref = line.ref.trim();
			const to = linkTo(line, name, `${g}:${lines.length}`);
			const fresh = ref && !refs.has(ref);
			if (fresh) refs.add(ref);
			lines.push({
				...(fresh ? { ref } : {}),
				quantity:
					parseQuantity(line.quantity) === undefined
						? ""
						: line.quantity.trim(),
				unit: line.unit,
				name,
				note: localized(line.note),
				link: { to, name },
			});
		}
		return { label: localized(group.label), lines };
	});

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
			const title = localized(step.title);
			const minutes = stepMinutes(step.minutes);
			if (isBlank(text)) {
				if (isBlank(title)) {
					warn("Dropped a step with no text and no title.");
					return [];
				}
				// A step that came back as a title alone keeps the title as its text.
				warn("A step came back without text; its title stands in.");
				return [{ title: {}, text: title, minutes }];
			}
			return [{ title, text, parts, minutes }];
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
			notes: output.recipe.notes
				.map(localized)
				.filter((note) => !isBlank(note)),
			references: [
				...new Set(output.recipe.references.map((url) => url.trim())),
			]
				.filter(isWebAddress)
				.map((url) => ({ url })),
		},
		newIngredients: [...created.values()],
		matches,
	};
}
