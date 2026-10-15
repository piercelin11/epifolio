"use server";

import { refresh } from "next/cache";

import {
	type ActionResult,
	failedResult,
	invalidInput,
} from "@/lib/action-result";
import { getCurrentUserId } from "@/lib/current-user";

import { getRecipeDraft, writeRecipe } from "../data/recipe-draft";
import { type RecipeDraft, recipeDraftSchema } from "../schema";

/** The recipe in both locales, for the recipe card. */
export async function loadRecipeDraft(
	recipeId: string
): Promise<ActionResult<RecipeDraft>> {
	const draft = await getRecipeDraft(await getCurrentUserId(), recipeId);
	return draft
		? { ok: true, data: draft }
		: { ok: false, error: { key: "recipeNotFound" } };
}

/** Saves the recipe card's draft of an existing recipe. */
export async function saveRecipe(draft: RecipeDraft): Promise<ActionResult> {
	const parsed = recipeDraftSchema.safeParse(draft);
	if (!parsed.success) return invalidInput(parsed.error);
	if (!parsed.data.id) return { ok: false, error: { key: "recipeNotFound" } };
	try {
		await writeRecipe(await getCurrentUserId(), parsed.data.id, parsed.data);
	} catch (error) {
		return failedResult(error);
	}
	refresh();
	return { ok: true, data: undefined };
}
