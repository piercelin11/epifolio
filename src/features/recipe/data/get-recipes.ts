import "server-only";

import { z } from "zod";

import { prisma } from "@/lib/db";
import {
	defaultLocale,
	type Locale,
	localize,
	localizedSchema,
	localizedTextSchema,
	readLocalizedText,
	readOptionalLocalizedText,
} from "@/lib/i18n/localized";

import type { Quantity, Recipe } from "../types";

const notesSchema = z.array(localizedTextSchema);

const stepTextSchema = localizedSchema(
	z.array(z.object({ text: z.string(), lineId: z.string().optional() }))
);

function quantity(min: number | null, max: number | null) {
	if (min === null) return undefined;
	return (max === null ? min : [min, max]) satisfies Quantity;
}

/** The user's recipes with their ingredient lines and steps in order. */
export async function getRecipes(
	userId: string,
	locale: Locale = defaultLocale
): Promise<Recipe[]> {
	const recipes = await prisma.recipe.findMany({
		where: { userId },
		orderBy: [{ createdAt: "asc" }, { id: "asc" }],
		include: {
			ingredientGroups: {
				orderBy: { position: "asc" },
				include: { lines: { orderBy: { position: "asc" } } },
			},
			stepGroups: {
				orderBy: { position: "asc" },
				include: { steps: { orderBy: { position: "asc" } } },
			},
		},
	});

	return recipes.map((recipe) => ({
		id: recipe.id,
		name: readLocalizedText(recipe.name, locale),
		serves: recipe.serves ?? undefined,
		timeMinutes: recipe.timeMinutes ?? undefined,
		ingredientGroups: recipe.ingredientGroups.map((group) => ({
			label: readOptionalLocalizedText(group.label, locale),
			items: group.lines.map((line) => ({
				id: line.id,
				name: readLocalizedText(line.name, locale),
				quantity: quantity(line.quantityMin, line.quantityMax),
				unit: line.unit ?? undefined,
				note: readOptionalLocalizedText(line.note, locale),
				ingredientId: line.ingredientId ?? undefined,
			})),
		})),
		stepGroups: recipe.stepGroups.map((group) => ({
			label: readOptionalLocalizedText(group.label, locale),
			steps: group.steps.map((step) => ({
				title: readOptionalLocalizedText(step.title, locale),
				minutes: step.minutes ?? undefined,
				text: localize(stepTextSchema.parse(step.text), locale) ?? [],
			})),
		})),
		notes: notesSchema
			.parse(recipe.notes)
			.map((note) => localize(note, locale) ?? ""),
	}));
}
