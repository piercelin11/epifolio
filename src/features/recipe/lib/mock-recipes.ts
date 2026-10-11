import mockData from "@/features/menu/mock-data.json";

import type { Recipe } from "../types";

// The mock dishes mix recipe and menu item fields; only the recipe fields
// are read here. A dish id doubles as its recipe id.
interface MockDish {
	id: string;
	name: string;
	serves?: number;
	timeMinutes?: number;
	ingredients?: {
		group: string;
		items: { name: string; amount: string; note?: string }[];
	}[];
	steps?: { title: string; minutes?: number; text: string }[];
	notes?: string[];
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
			items: group.items,
		})),
		steps: dish.steps ?? [],
		notes: dish.notes ?? [],
	}));
}
