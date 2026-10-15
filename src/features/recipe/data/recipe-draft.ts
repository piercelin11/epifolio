import "server-only";

import { z } from "zod";

import { getIngredientNames } from "@/features/ingredient/data/get-ingredient-names";
import {
	type IngredientNames,
	matchIngredient,
} from "@/features/ingredient/lib/match-ingredient";
import { Prisma } from "@/generated/prisma/client";
import { RecordNotFoundError } from "@/lib/action-result";
import { prisma } from "@/lib/db";
import {
	localizedSchema,
	localizedTextSchema,
	mapLocalized,
	sameLocalizedText,
	type Locale,
	type LocalizedText,
} from "@/lib/i18n/localized";

import { formatQuantityInput } from "../lib/parse-quantity";
import type { RecipeData, RecipeDraft } from "../schema";
import { isUnit } from "../units";

const stepTextSchema = localizedSchema(
	z.array(z.object({ text: z.string(), lineId: z.string().optional() }))
);

type StepText = z.infer<typeof stepTextSchema>;

const readText = (json: unknown): LocalizedText =>
	json === null ? {} : localizedTextSchema.parse(json);

const joinStepText = (text: StepText): LocalizedText =>
	mapLocalized(text, (parts) => parts.map((part) => part.text).join(""));

/** A recipe in both locales, as the recipe card edits it. */
export async function getRecipeDraft(
	userId: string,
	recipeId: string
): Promise<RecipeDraft | null> {
	const recipe = await prisma.recipe.findFirst({
		where: { id: recipeId, userId },
		include: {
			ingredientGroups: {
				orderBy: { position: "asc" },
				include: { lines: { orderBy: { position: "asc" } } },
			},
			stepGroups: {
				orderBy: { position: "asc" },
				include: { steps: { orderBy: { position: "asc" } } },
			},
			referenceLinks: { orderBy: { position: "asc" } },
		},
	});
	if (!recipe) return null;

	return {
		id: recipe.id,
		name: readText(recipe.name),
		serves: recipe.serves,
		ingredientGroups: recipe.ingredientGroups.map((group) => ({
			id: group.id,
			label: readText(group.label),
			lines: group.lines.map((line) => ({
				id: line.id,
				quantity: formatQuantityInput(line.quantityMin, line.quantityMax),
				unit: line.unit && isUnit(line.unit) ? line.unit : "",
				name: readText(line.name),
				note: readText(line.note),
			})),
		})),
		stepGroups: recipe.stepGroups.map((group) => ({
			id: group.id,
			label: readText(group.label),
			steps: group.steps.map((step) => ({
				id: step.id,
				title: readText(step.title),
				text: joinStepText(stepTextSchema.parse(step.text)),
			})),
		})),
		references: recipe.referenceLinks.map((link) => ({ url: link.url })),
	};
}

/** The catalog ingredient a line's wording names, trying each locale. */
function matchLine(name: LocalizedText, catalog: IngredientNames[]) {
	return Object.values(name)
		.map((text) => text && matchIngredient(text, catalog))
		.find(Boolean);
}

type LineData = RecipeData["ingredientGroups"][number]["lines"][number];
type StepData = RecipeData["stepGroups"][number]["steps"][number];

/**
 * The ingredient a line uses: an unchanged line keeps its own, a line
 * still worded as its explicit link was made uses that link, any other
 * line is matched by name. `created` maps new ingredients' keys to ids.
 */
function lineIngredient(
	line: LineData,
	previous: { name: unknown; ingredientId: string | null } | undefined,
	catalog: IngredientNames[],
	created: ReadonlyMap<string, string>
): string | null {
	if (previous && sameLocalizedText(readText(previous.name), line.name)) {
		return previous.ingredientId;
	}
	const link = line.link;
	if (link && sameLocalizedText(link.name, line.name)) {
		switch (link.to.kind) {
			case "none":
				return null;
			case "new":
				return created.get(link.to.key) ?? null;
			case "catalog": {
				const { ingredientId } = link.to;
				if (catalog.some((ingredient) => ingredient.id === ingredientId)) {
					return ingredientId;
				}
			}
		}
	}
	return matchLine(line.name, catalog) ?? null;
}

/**
 * A step's text for one locale: the previous runs while the text is
 * unchanged, else the draft's runs while they still join up to it (their
 * lines cited by id or ref), else one plain run.
 */
function stepRuns(
	step: StepData,
	value: string,
	locale: Locale,
	before: StepText,
	lineIds: ReadonlyMap<string, string>
): NonNullable<StepText[Locale]> {
	if (joinStepText(before)[locale] === value) return before[locale]!;
	const parts = step.parts?.[locale];
	if (parts && parts.map((part) => part.text).join("") === value) {
		return parts.map(({ text, line }) => {
			const lineId = line ? lineIds.get(line) : undefined;
			return lineId ? { text, lineId } : { text };
		});
	}
	return [{ text: value }];
}

/**
 * Writes a recipe's groups, lines, steps and references to match the draft.
 * Lines and steps that already exist keep their ids; an unchanged line
 * keeps its ingredient and an unchanged step keeps the lines it cites.
 */
async function writeRecipeContent(
	tx: Prisma.TransactionClient,
	recipeId: string,
	recipe: RecipeData,
	catalog: IngredientNames[],
	created: ReadonlyMap<string, string> = new Map()
) {
	const existing = await tx.recipe.findUniqueOrThrow({
		where: { id: recipeId },
		include: {
			ingredientGroups: { include: { lines: true } },
			stepGroups: { include: { steps: true } },
		},
	});
	const groupIds = new Set(existing.ingredientGroups.map((g) => g.id));
	const lines = new Map(
		existing.ingredientGroups.flatMap((g) => g.lines).map((l) => [l.id, l])
	);
	const stepGroupIds = new Set(existing.stepGroups.map((g) => g.id));
	const steps = new Map(
		existing.stepGroups.flatMap((g) => g.steps).map((s) => [s.id, s])
	);
	const draftLines = recipe.ingredientGroups.flatMap((g) => g.lines);
	const draftSteps = recipe.stepGroups.flatMap((g) => g.steps);
	if (
		recipe.ingredientGroups.some((g) => g.id && !groupIds.has(g.id)) ||
		draftLines.some((l) => l.id && !lines.has(l.id)) ||
		recipe.stepGroups.some((g) => g.id && !stepGroupIds.has(g.id)) ||
		draftSteps.some((s) => s.id && !steps.has(s.id))
	) {
		throw new RecordNotFoundError({ key: "recipeChanged" });
	}

	const keptGroups = new Set<string>();
	const keptLines = new Set<string>();
	/** Saved line ids by the id or ref a step's parts cite them with. */
	const lineIds = new Map<string, string>();
	for (const [g, group] of recipe.ingredientGroups.entries()) {
		const fields = { label: group.label ?? Prisma.DbNull, position: g };
		const { id: groupId } = group.id
			? await tx.ingredientGroup.update({
					where: { id: group.id },
					data: fields,
				})
			: await tx.ingredientGroup.create({ data: { ...fields, recipeId } });
		keptGroups.add(groupId);

		for (const [i, line] of group.lines.entries()) {
			const previous = line.id ? lines.get(line.id) : undefined;
			const ingredientId = lineIngredient(line, previous, catalog, created);
			const data = {
				groupId,
				position: i,
				quantityMin: line.quantity?.min ?? null,
				quantityMax: line.quantity?.max ?? null,
				unit: line.unit,
				name: line.name,
				note: line.note ?? Prisma.DbNull,
				ingredientId,
			};
			const { id } = line.id
				? await tx.recipeIngredient.update({ where: { id: line.id }, data })
				: await tx.recipeIngredient.create({ data });
			keptLines.add(id);
			lineIds.set(line.id ?? line.ref ?? id, id);
		}
	}

	const keptStepGroups = new Set<string>();
	const keptSteps = new Set<string>();
	for (const [g, group] of recipe.stepGroups.entries()) {
		const fields = { label: group.label ?? Prisma.DbNull, position: g };
		const { id: groupId } = group.id
			? await tx.stepGroup.update({ where: { id: group.id }, data: fields })
			: await tx.stepGroup.create({ data: { ...fields, recipeId } });
		keptStepGroups.add(groupId);

		for (const [i, step] of group.steps.entries()) {
			const previous = step.id ? steps.get(step.id) : undefined;
			const before = previous ? stepTextSchema.parse(previous.text) : {};
			const text: StepText = mapLocalized(step.text, (value, locale) =>
				stepRuns(step, value, locale, before, lineIds)
			);
			const data = {
				groupId,
				position: i,
				title: step.title ?? Prisma.DbNull,
				text,
			};
			const { id } = step.id
				? await tx.step.update({ where: { id: step.id }, data })
				: await tx.step.create({ data });
			keptSteps.add(id);
		}
	}

	const unkept = (ids: Iterable<string>, kept: Set<string>) => ({
		id: { in: [...ids].filter((id) => !kept.has(id)) },
	});
	await tx.recipeIngredient.deleteMany({
		where: unkept(lines.keys(), keptLines),
	});
	await tx.ingredientGroup.deleteMany({ where: unkept(groupIds, keptGroups) });
	await tx.step.deleteMany({ where: unkept(steps.keys(), keptSteps) });
	await tx.stepGroup.deleteMany({
		where: unkept(stepGroupIds, keptStepGroups),
	});

	await tx.referenceLink.deleteMany({ where: { recipeId } });
	await tx.referenceLink.createMany({
		data: recipe.references.map((link, position) => ({
			recipeId,
			url: link.url,
			position,
		})),
	});
}

/** Saves changes to one of the user's recipes. */
export async function writeRecipe(
	userId: string,
	recipeId: string,
	recipe: RecipeData
): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const owned = await tx.recipe.findFirst({
			where: { id: recipeId, userId },
			select: { id: true },
		});
		if (!owned) throw new RecordNotFoundError({ key: "recipeNotFound" });
		await tx.recipe.update({
			where: { id: recipeId },
			data: { name: recipe.name, serves: recipe.serves },
		});
		await writeRecipeContent(
			tx,
			recipeId,
			recipe,
			await getIngredientNames(tx)
		);
	});
}

/**
 * Creates a recipe for the user inside a caller's transaction and returns
 * its id; used when a new dish is added to a menu.
 */
export async function createRecipe(
	tx: Prisma.TransactionClient,
	userId: string,
	recipe: RecipeData,
	catalog: IngredientNames[],
	created?: ReadonlyMap<string, string>
): Promise<string> {
	const { id } = await tx.recipe.create({
		data: { userId, name: recipe.name, serves: recipe.serves, notes: [] },
	});
	await writeRecipeContent(tx, id, recipe, catalog, created);
	return id;
}
