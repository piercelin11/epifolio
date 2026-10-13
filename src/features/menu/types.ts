// Presentation types for the menu. Components depend only on these,
// never on the shape of the database rows (see the data/ modules).

import type { MenuThemeId } from "@/features/menu-theme/menu-themes";

/** One phrase of a menu item description, e.g. "Golden garlic". */
export interface DescriptionPart {
	text: string;
	/** The ingredient this phrase names, if any. */
	ingredientId?: string;
}

export interface MenuItem {
	id: string;
	name: string;
	/** Phrases shown joined by " · ". */
	description?: DescriptionPart[];
	/** Absent until it is worked out from ingredient prices. */
	price?: number;
	/** The recipe this item presents; a reference, not a copy. */
	recipeId: string;
}

export interface Section {
	id: string;
	label?: string;
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

/** One book on the shelf: a single menu group in its own theme. */
export interface MenuBook {
	id: string;
	themeId: MenuThemeId;
	group: MenuGroup;
}
