import "server-only";

import { z } from "zod";

import { ConflictError, RecordNotFoundError } from "@/lib/action-result";
import { prisma } from "@/lib/db";

import { matchIngredient } from "../lib/match-ingredient";
import { type IngredientDraftData, unitColumns } from "../schema";
import { getIngredientNames } from "./get-ingredient-names";

const weightsSchema = z.record(z.string(), z.number());

/** Aliases without repeats or the ingredient's own names, ignoring case. */
function cleanAliases(aliases: string[], names: (string | undefined)[]) {
	const seen = new Set(names.map((name) => name?.toLowerCase()));
	return aliases.filter((alias) => {
		const key = alias.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

const sameWeights = (a: Record<string, number>, b: Record<string, number>) =>
	Object.keys(a).length === Object.keys(b).length &&
	Object.entries(a).every(([unit, grams]) => b[unit] === grams);

/**
 * Writes an ingredient edited on its card. A name, or a newly added alias,
 * that another ingredient already goes by is refused. An estimate that was
 * changed by hand stops being an estimate.
 */
export async function writeIngredient(draft: IngredientDraftData) {
	await prisma.$transaction(async (tx) => {
		const current = await tx.ingredient.findUnique({
			where: { id: draft.id },
		});
		if (!current) throw new RecordNotFoundError({ key: "ingredientNotFound" });

		const others = (await getIngredientNames(tx)).filter(
			(ingredient) => ingredient.id !== draft.id
		);
		for (const name of Object.values(draft.name)) {
			if (name && matchIngredient(name, others)) {
				throw new ConflictError({ key: "ingredientExists", values: { name } });
			}
		}
		const names = Object.values(draft.name);
		const aliases = cleanAliases(draft.aliases, names);
		const before = new Set(
			z
				.array(z.string())
				.parse(current.aliases)
				.map((alias) => alias.toLowerCase())
		);
		for (const alias of aliases) {
			if (before.has(alias.toLowerCase())) continue;
			const id = matchIngredient(alias, others);
			if (id) {
				const other = others.find((ingredient) => ingredient.id === id);
				throw new ConflictError({
					key: "aliasTaken",
					values: { name: alias, ingredient: other?.names[0] ?? "" },
				});
			}
		}

		const { price, nutrition, units } = draft;
		const columns = unitColumns(units);
		const sameNutrition =
			current.calories === nutrition.calories &&
			current.protein === nutrition.protein &&
			current.carbs === nutrition.carbs &&
			current.fat === nutrition.fat;
		const sameUnits =
			current.defaultUnit === units.defaultUnit &&
			current.density === units.density &&
			sameWeights(
				weightsSchema.parse(current.unitWeights),
				columns.unitWeights
			);

		await tx.ingredient.update({
			where: { id: draft.id },
			data: {
				name: draft.name,
				aliases,
				priceAmount: price?.amount ?? null,
				priceQuantity: price?.quantity ?? null,
				priceUnit: price?.unit ?? null,
				...nutrition,
				nutritionEstimated: current.nutritionEstimated && sameNutrition,
				...columns,
				unitsEstimated: current.unitsEstimated && sameUnits,
			},
		});
	});
}
