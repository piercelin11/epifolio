import "server-only";

import { z } from "zod";

import type { RecipeData } from "@/features/recipe/schema";
import type { Prisma } from "@/generated/prisma/client";
import { ConflictError, RecordNotFoundError } from "@/lib/action-result";
import {
	localize,
	localizedTextSchema,
	sameLocalizedText,
} from "@/lib/i18n/localized";

import { matchIngredient } from "../lib/match-ingredient";
import type { CatalogChangesData } from "../schema";
import { getIngredientNames } from "./get-ingredient-names";

/** Keys of the new ingredients that some line of the recipe still cites. */
function citedKeys(recipe: RecipeData): Set<string> {
	const keys = new Set<string>();
	for (const line of recipe.ingredientGroups.flatMap((g) => g.lines)) {
		const link = line.link;
		if (link?.to.kind === "new" && sameLocalizedText(link.name, line.name)) {
			keys.add(link.to.key);
		}
	}
	return keys;
}

/**
 * Applies a new recipe's catalog changes inside the caller's transaction
 * (ADR-0025): adds the aliases, then creates the new ingredients the
 * recipe's lines still cite. Returns the created ids by key.
 */
export async function writeCatalogChanges(
	tx: Prisma.TransactionClient,
	changes: CatalogChangesData,
	recipe: RecipeData
): Promise<Map<string, string>> {
	for (const { ingredientId, alias } of changes.aliases) {
		const ingredient = await tx.ingredient.findUnique({
			where: { id: ingredientId },
			select: { name: true, aliases: true },
		});
		if (!ingredient) throw new RecordNotFoundError("Ingredient not found.");
		const aliases = z.array(z.string()).parse(ingredient.aliases);
		const names = Object.values(localizedTextSchema.parse(ingredient.name));
		const known = [...names, ...aliases].some(
			(a) => a?.toLowerCase() === alias.toLowerCase()
		);
		if (!known) {
			await tx.ingredient.update({
				where: { id: ingredientId },
				data: { aliases: [...aliases, alias] },
			});
		}
	}

	const keys = citedKeys(recipe);
	const created = new Map<string, string>();
	const catalog = await getIngredientNames(tx);
	for (const ingredient of changes.ingredients) {
		if (!keys.has(ingredient.key) || created.has(ingredient.key)) continue;
		const clash = Object.values(ingredient.name).some(
			(name) => name && matchIngredient(name, catalog)
		);
		if (clash) {
			throw new ConflictError(
				`An ingredient named "${localize(ingredient.name)}" already exists.`
			);
		}
		const { id } = await tx.ingredient.create({
			data: {
				name: ingredient.name,
				// An alias that only repeats a name adds nothing.
				aliases: ingredient.aliases.filter(
					(alias) =>
						!Object.values(ingredient.name).some(
							(name) => name?.toLowerCase() === alias.toLowerCase()
						)
				),
				...ingredient.nutrition,
				nutritionEstimated: ingredient.nutritionEstimated,
			},
		});
		created.set(ingredient.key, id);
		catalog.push({
			id,
			names: [...Object.values(ingredient.name), ...ingredient.aliases],
		});
	}
	return created;
}
