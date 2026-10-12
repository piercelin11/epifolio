import mockData from "@/features/menu/mock-data.json";

import type { Quantity, Recipe, RecipeIngredient } from "../types";

// The mock dishes mix recipe and menu item fields; only the recipe fields
// are read here. A dish id doubles as its recipe id.
interface MockIngredient {
	name: string;
	/** Free text, e.g. "200 g", "80-100 g", "1/2 small", "to taste". */
	amount: string;
	note?: string;
	ingredientId?: string;
}

interface MockStep {
	title: string;
	minutes?: number;
	text: string;
}

interface MockDish {
	id: string;
	name: string;
	serves?: number;
	timeMinutes?: number;
	ingredients?: { group?: string; items: MockIngredient[] }[];
	steps?: { group?: string; items: MockStep[] }[];
	notes?: string[];
}

/** Units written after a quantity; plurals map to the singular. */
const mockUnits: Record<string, string> = {
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
function parseAmount(item: MockIngredient): RecipeIngredient {
	const { name, amount, note, ingredientId } = item;
	const match = amountPattern.exec(amount.trim());
	if (!match) {
		return {
			name,
			note: [amount, note].filter(Boolean).join(", "),
			ingredientId,
		};
	}
	const [, low, high, word, rest] = match;
	const quantity: Quantity = high
		? [parseNumber(low), parseNumber(high)]
		: parseNumber(low);
	const unit = word && mockUnits[word];
	const prefix = [unit ? undefined : word, rest].filter(Boolean).join(" ");
	return {
		name: prefix ? `${prefix} ${name}` : name,
		quantity,
		unit,
		note,
		ingredientId,
	};
}

/** Builds recipes from mock data. */
export function getMockRecipes(dishes: MockDish[] = mockData.dishes): Recipe[] {
	return dishes.map((dish) => ({
		id: dish.id,
		name: dish.name,
		serves: dish.serves,
		timeMinutes: dish.timeMinutes,
		ingredientGroups: (dish.ingredients ?? []).map((group) => ({
			label: group.group,
			items: group.items.map(parseAmount),
		})),
		stepGroups: (dish.steps ?? []).map((group) => ({
			label: group.group,
			steps: group.items,
		})),
		notes: dish.notes ?? [],
	}));
}
