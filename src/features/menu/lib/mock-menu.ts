import mockData from "../mock-data.json";
import type { Menu, MenuGroup, Section } from "../types";

// The mock dishes mix recipe and menu item fields; only the menu item
// fields (name, description, price) are read here. A dish id doubles as
// its recipe id.
interface MockGroup {
	id: string;
	label: string;
	order: number;
}

interface MockCategory extends MockGroup {
	group: string;
}

interface MockDish {
	id: string;
	name: string;
	category: string;
	description?: string;
	price: number;
}

interface MockData {
	book: {
		title: string;
		currency: string;
		groups: MockGroup[];
		categories: MockCategory[];
	};
	dishes: MockDish[];
}

const byOrder = (a: { order: number }, b: { order: number }) =>
	a.order - b.order;

/** Builds a Menu from mock data; empty sections and groups are dropped. */
export function getMockMenu(data: MockData = mockData): Menu {
	const sections = (groupId: string): Section[] =>
		data.book.categories
			.filter((category) => category.group === groupId)
			.sort(byOrder)
			.map((category) => ({
				id: category.id,
				label: category.label,
				items: data.dishes
					.filter((dish) => dish.category === category.id)
					.map((dish) => ({
						id: dish.id,
						name: dish.name,
						description: dish.description || undefined,
						price: dish.price,
						recipeId: dish.id,
					})),
			}))
			.filter((section) => section.items.length > 0);

	const groups: MenuGroup[] = [...data.book.groups]
		.sort(byOrder)
		.map((group) => ({
			id: group.id,
			label: group.label,
			sections: sections(group.id),
		}))
		.filter((group) => group.sections.length > 0);

	return {
		title: data.book.title,
		currency: data.book.currency,
		groups,
	};
}
