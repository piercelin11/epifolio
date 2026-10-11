import mockData from "../mock-data.json";
import type { Menu, Section } from "../types";

// The mock dishes mix recipe and menu item fields; only the menu item
// fields (name, description, price) are read here.
interface MockCategory {
	id: string;
	label: string;
	order: number;
}

interface MockDish {
	id: string;
	name: string;
	category: string;
	description?: string;
	price: number;
}

interface MockData {
	book: { title: string; currency: string; categories: MockCategory[] };
	dishes: MockDish[];
}

/** Builds a Menu from mock data; sections without items are dropped. */
export function getMockMenu(data: MockData = mockData): Menu {
	const sections: Section[] = [...data.book.categories]
		.sort((a, b) => a.order - b.order)
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
				})),
		}))
		.filter((section) => section.items.length > 0);

	return {
		title: data.book.title,
		currency: data.book.currency,
		sections,
	};
}
