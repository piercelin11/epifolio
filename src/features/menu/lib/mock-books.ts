import type { MenuThemeId } from "@/features/menu-theme/menu-themes";

import mockData from "../mock-data.json";
import type { MenuBook, MenuGroup } from "../types";
import { getMockMenu } from "./mock-menu";

const mockBooks: { groupId: string; themeId: MenuThemeId }[] = [
	{ groupId: "main", themeId: "classic" },
	{ groupId: "dessert", themeId: "olive" },
	{ groupId: "drinks", themeId: "navy" },
	{ groupId: "specials", themeId: "cocoa" },
];

/**
 * One book per mock group. Only Main has dishes so far, so groups without
 * any borrow its sections as placeholder content.
 */
export function getMockBooks(): MenuBook[] {
	const { groups } = getMockMenu();
	const placeholder = groups[0]?.sections ?? [];

	return mockBooks.map(({ groupId, themeId }) => {
		const group: MenuGroup = groups.find((g) => g.id === groupId) ?? {
			id: groupId,
			label:
				mockData.book.groups.find((g) => g.id === groupId)?.label ?? groupId,
			sections: placeholder,
		};
		return { id: `book-${groupId}`, themeId, group };
	});
}
