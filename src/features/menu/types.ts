// Presentation types for the menu. Components depend only on these,
// never on the shape of a data source (mock JSON now, Prisma later).

export interface MenuItem {
	id: string;
	name: string;
	description?: string;
	price: number;
	/** The recipe this item presents; a reference, not a copy. */
	recipeId: string;
}

export interface Section {
	id: string;
	label: string;
	items: MenuItem[];
}

/** Top-level division of a menu (e.g. Main, Dessert, Drinks). */
export interface MenuGroup {
	id: string;
	label: string;
	sections: Section[];
}

export interface Menu {
	title: string;
	currency: string;
	groups: MenuGroup[];
}
