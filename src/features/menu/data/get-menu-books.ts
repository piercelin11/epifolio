import "server-only";

import { z } from "zod";

import { resolveMenuThemeId } from "@/features/menu-theme/menu-themes";
import { prisma } from "@/lib/db";
import {
	defaultLocale,
	type Locale,
	localize,
	localizedSchema,
	readLocalizedText,
	readOptionalLocalizedText,
} from "@/lib/i18n/localized";

import type { MenuBook } from "../types";

const descriptionSchema = localizedSchema(
	z.array(z.object({ text: z.string(), ingredientId: z.string().optional() }))
);

/** The user's menu books: one per menu group, in menu then group order. */
export async function getMenuBooks(
	userId: string,
	locale: Locale = defaultLocale
): Promise<MenuBook[]> {
	const groups = await prisma.menuGroup.findMany({
		where: { menu: { userId } },
		orderBy: [{ menu: { createdAt: "asc" } }, { position: "asc" }],
		include: {
			sections: {
				orderBy: { position: "asc" },
				include: { items: { orderBy: { position: "asc" } } },
			},
		},
	});

	return groups.map((group) => ({
		id: group.id,
		themeId: resolveMenuThemeId(group.themeId),
		group: {
			id: group.id,
			label: readLocalizedText(group.label, locale),
			sections: group.sections.map((section) => ({
				id: section.id,
				label: readOptionalLocalizedText(section.label, locale),
				items: section.items.map((item) => {
					const description =
						item.description === null
							? undefined
							: localize(descriptionSchema.parse(item.description), locale);
					return {
						id: item.id,
						name: readLocalizedText(item.name, locale),
						description: description?.length ? description : undefined,
						price: item.price,
						recipeId: item.recipeId,
					};
				}),
			})),
		},
	}));
}
