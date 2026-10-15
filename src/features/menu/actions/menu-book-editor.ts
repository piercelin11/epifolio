"use server";

import { refresh } from "next/cache";

import {
	type CatalogChanges,
	catalogChangesSchema,
} from "@/features/ingredient/schema";
import { recipeDraftSchema, type RecipeDraft } from "@/features/recipe/schema";
import {
	type ActionResult,
	failedResult,
	invalidInput,
} from "@/lib/action-result";
import { getCurrentUserId } from "@/lib/current-user";

import { writeNewDish } from "../data/create-dish";
import { getMenuBookDraft, writeMenuBook } from "../data/menu-book-draft";
import {
	type DishDraft,
	dishDraftSchema,
	type MenuBookDraft,
	menuBookDraftSchema,
} from "../schema";

/** The menu book in both locales, for the menu card. */
export async function loadMenuBookDraft(
	bookId: string
): Promise<ActionResult<MenuBookDraft>> {
	const draft = await getMenuBookDraft(await getCurrentUserId(), bookId);
	return draft
		? { ok: true, data: draft }
		: { ok: false, error: { key: "menuNotFound" } };
}

/** Saves the menu card's draft in one go. */
export async function saveMenuBook(
	draft: MenuBookDraft
): Promise<ActionResult> {
	const parsed = menuBookDraftSchema.safeParse(draft);
	if (!parsed.success) return invalidInput(parsed.error);
	try {
		await writeMenuBook(await getCurrentUserId(), parsed.data);
	} catch (error) {
		return failedResult(error);
	}
	refresh();
	return { ok: true, data: undefined };
}

/** Adds a new dish and its recipe to the end of a section. */
export async function createDish(input: {
	sectionId: string;
	dish: DishDraft;
	recipe: RecipeDraft;
	/** Ingredients and aliases an import decided on (ADR-0025). */
	catalog?: CatalogChanges;
}): Promise<ActionResult<{ recipeId: string; itemId: string }>> {
	const dish = dishDraftSchema.safeParse(input.dish);
	if (!dish.success) return invalidInput(dish.error);
	const recipe = recipeDraftSchema.safeParse(input.recipe);
	if (!recipe.success) return invalidInput(recipe.error);
	const catalog = catalogChangesSchema.safeParse(
		input.catalog ?? { ingredients: [], aliases: [] }
	);
	if (!catalog.success) return invalidInput(catalog.error);
	try {
		const created = await writeNewDish(
			await getCurrentUserId(),
			input.sectionId,
			dish.data,
			recipe.data,
			catalog.data
		);
		refresh();
		return { ok: true, data: created };
	} catch (error) {
		return failedResult(error);
	}
}
