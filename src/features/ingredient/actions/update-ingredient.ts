"use server";

import { refresh } from "next/cache";

import {
	type ActionResult,
	failedResult,
	invalidInput,
} from "@/lib/action-result";

import { writeIngredient } from "../data/write-ingredient";
import { type IngredientDraft, ingredientDraftSchema } from "../schema";

/** Saves an ingredient edited on the back of its card. */
export async function updateIngredient(
	draft: IngredientDraft
): Promise<ActionResult> {
	const parsed = ingredientDraftSchema.safeParse(draft);
	if (!parsed.success) return invalidInput(parsed.error);
	try {
		await writeIngredient(parsed.data);
	} catch (error) {
		return failedResult(error);
	}
	refresh();
	return { ok: true, data: undefined };
}
