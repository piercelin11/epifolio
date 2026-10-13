// Fills the database with the sample menu, recipes and ingredient catalog
// from seed-data.json.
// Run with `pnpm exec prisma db seed`. Every table is cleared first, so it
// can be run again at any time.

import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { menuThemes } from "../src/features/menu-theme/menu-themes";
import seedData from "./seed-data.json";
import { isUnit } from "../src/features/recipe/units";
import { type Prisma, PrismaClient } from "../src/generated/prisma/client";
import { defaultUserId } from "../src/lib/current-user";
import type { LocalizedText } from "../src/lib/i18n/localized";

interface SeedLine {
	name: string;
	/** Free text, e.g. "200 g", "80-100 g", "1/2 small", "to taste". */
	amount: string;
	note?: string;
	ingredientId?: string;
}

interface SeedDish {
	id: string;
	name: string;
	originalName?: string;
	category: string;
	description: { text: string; ingredientId?: string }[];
	price: number;
	serves?: number;
	timeMinutes?: number;
	ingredients?: { group?: string; items: SeedLine[] }[];
	steps?: {
		group?: string;
		items: { title: string; minutes?: number; text: string }[];
	}[];
	notes?: string[];
}

const dishes: SeedDish[] = seedData.dishes;

const prisma = new PrismaClient({
	adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }),
});

/** English text as a LocalizedText; the seed data has no translations. */
function en(text: string): LocalizedText;
function en(text: string | undefined): LocalizedText | undefined;
function en(text: string | undefined): LocalizedText | undefined {
	return text === undefined ? undefined : { en: text };
}

/** Name of the one user until accounts exist. */
const defaultUserName = "Pierce Lin";

const byOrder = (a: { order: number }, b: { order: number }) =>
	a.order - b.order;

/** Spellings written after a quantity, mapped to a unit id. */
const amountUnits: Record<string, string> = {
	g: "g",
	kg: "kg",
	ml: "ml",
	L: "L",
	tsp: "tsp",
	tbsp: "tbsp",
	clove: "clove",
	cloves: "clove",
};

const number = String.raw`\d+(?:\.\d+)?(?:/\d+)?`;
const amountPattern = new RegExp(
	String.raw`^(${number})(?:-(${number}))?(?:\s+(\S+))?(?:\s+(.*))?$`
);

function parseNumber(text: string): number {
	const [top, bottom] = text.split("/").map(Number);
	return bottom ? top / bottom : top;
}

/**
 * Splits a free-text amount into quantity and unit. A word after the
 * quantity that is not a unit ("1/2 small") joins the name; an amount with
 * no quantity ("to taste") becomes part of the note.
 */
function parseLine(dish: SeedDish, line: SeedLine) {
	const { name, amount, note, ingredientId } = line;
	const match = amountPattern.exec(amount.trim());
	if (!match) {
		return {
			name: en(name),
			note: en([amount, note].filter(Boolean).join(", ")),
			ingredientId,
		};
	}
	const [, low, high, word, rest] = match;
	const unit = word ? amountUnits[word] : undefined;
	if (unit && !isUnit(unit)) {
		throw new Error(`${dish.id}: unknown unit "${unit}" in "${name}"`);
	}
	const prefix = [unit ? undefined : word, rest].filter(Boolean).join(" ");
	return {
		name: en(prefix ? `${prefix} ${name}` : name),
		quantityMin: parseNumber(low),
		quantityMax: high ? parseNumber(high) : undefined,
		unit,
		note: en(note),
		ingredientId,
	};
}

function recipeData(dish: SeedDish): Prisma.RecipeCreateInput {
	return {
		id: dish.id,
		user: { connect: { id: defaultUserId } },
		name: { en: dish.name, zh: dish.originalName },
		serves: dish.serves,
		timeMinutes: dish.timeMinutes,
		notes: (dish.notes ?? []).map((note) => en(note)),
		ingredientGroups: {
			create: (dish.ingredients ?? []).map((group, g) => ({
				label: en(group.group),
				position: g,
				lines: {
					create: group.items.map((line, i) => ({
						...parseLine(dish, line),
						position: i,
					})),
				},
			})),
		},
		stepGroups: {
			create: (dish.steps ?? []).map((group, g) => ({
				label: en(group.group),
				position: g,
				steps: {
					create: group.items.map((step, i) => ({
						title: en(step.title),
						minutes: step.minutes,
						text: { en: [{ text: step.text }] },
						position: i,
					})),
				},
			})),
		},
	};
}

/**
 * Sections of a group with the dishes in each; empty sections are dropped.
 * Groups without any dishes yet borrow the first group's sections, so every
 * book has content (menu items may share a recipe).
 */
function menuSections() {
	const { categories } = seedData.book;
	const sectionsOf = (groupId: string) =>
		categories
			.filter((category) => category.group === groupId)
			.sort(byOrder)
			.map((category) => ({
				label: "label" in category ? category.label : undefined,
				dishes: dishes.filter((dish) => dish.category === category.id),
			}))
			.filter((section) => section.dishes.length > 0);

	const groups = [...seedData.book.groups].sort(byOrder);
	const placeholder =
		groups.map((group) => sectionsOf(group.id)).find((s) => s.length) ?? [];
	return groups.map((group) => {
		const sections = sectionsOf(group.id);
		return { group, sections: sections.length ? sections : placeholder };
	});
}

function menuData(): Prisma.MenuCreateInput {
	const { book } = seedData;
	return {
		user: { connect: { id: defaultUserId } },
		title: en(book.title),
		currency: book.currency,
		groups: {
			create: menuSections().map(({ group, sections }, g) => {
				if (!menuThemes.some((theme) => theme.id === group.themeId)) {
					throw new Error(`${group.id}: unknown theme "${group.themeId}"`);
				}
				return {
					label: en(group.label),
					themeId: group.themeId,
					position: g,
					sections: {
						create: sections.map((section, s) => ({
							label: en(section.label),
							position: s,
							items: {
								create: section.dishes.map((dish, i) => ({
									recipeId: dish.id,
									name: en(dish.name),
									description: dish.description.length
										? { en: dish.description }
										: undefined,
									price: dish.price,
									position: i,
								})),
							},
						})),
					},
				};
			}),
		},
	};
}

function ingredientData(
	ingredient: (typeof seedData.ingredients)[number]
): Prisma.IngredientCreateInput {
	return {
		id: ingredient.id,
		name: en(ingredient.name),
		aliases: [],
		image: ingredient.image,
		priceAmount: ingredient.price?.amount,
		priceUnit: ingredient.price?.unit,
		...ingredient.nutrition,
	};
}

async function main() {
	await prisma.$transaction(async (tx) => {
		// Menu items first: they keep their recipes from being deleted.
		await tx.menuItem.deleteMany();
		await tx.menu.deleteMany();
		await tx.recipe.deleteMany();
		await tx.ingredient.deleteMany();
		await tx.user.deleteMany();

		await tx.user.create({
			data: { id: defaultUserId, name: defaultUserName },
		});
		for (const ingredient of seedData.ingredients) {
			await tx.ingredient.create({ data: ingredientData(ingredient) });
		}
		for (const dish of dishes) {
			await tx.recipe.create({ data: recipeData(dish) });
		}
		await tx.menu.create({ data: menuData() });
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
