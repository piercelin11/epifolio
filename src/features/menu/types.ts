// Presentation types for the menu book. Components depend only on these,
// never on the shape of a data source (mock JSON now, Prisma later).

export interface MenuItem {
	id: string;
	name: string;
	description?: string;
	price: number;
}

export interface Section {
	id: string;
	label: string;
	items: MenuItem[];
}

export interface Menu {
	title: string;
	currency: string;
	sections: Section[];
}

/** A two-page spread of the open menu book. */
export interface MenuSpread {
	left: Section[];
	right: Section[];
}
