import "server-only";

import { z } from "zod";

import { getIngredientNames } from "@/features/ingredient/data/get-ingredient-names";
import { Prisma } from "@/generated/prisma/client";
import { RecordNotFoundError } from "@/lib/action-result";
import { prisma } from "@/lib/db";
import { localizedSchema, localizedTextSchema } from "@/lib/i18n/localized";

import {
	type DescriptionParts,
	joinDescription,
	splitDescription,
} from "../lib/description";
import type { MenuBookData, MenuBookDraft } from "../schema";

const descriptionSchema = localizedSchema(
	z.array(z.object({ text: z.string(), ingredientId: z.string().optional() }))
);

function readDescription(json: unknown): DescriptionParts | null {
	return json === null ? null : descriptionSchema.parse(json);
}

/** A menu book in both locales, as the menu card edits it. */
export async function getMenuBookDraft(
	userId: string,
	bookId: string
): Promise<MenuBookDraft | null> {
	const group = await prisma.menuGroup.findFirst({
		where: { id: bookId, menu: { userId } },
		include: {
			sections: {
				orderBy: { position: "asc" },
				include: { items: { orderBy: { position: "asc" } } },
			},
		},
	});
	if (!group) return null;

	return {
		id: group.id,
		label: localizedTextSchema.parse(group.label),
		sections: group.sections.map((section) => ({
			id: section.id,
			label:
				section.label === null ? {} : localizedTextSchema.parse(section.label),
			items: section.items.map((item) => {
				const description = readDescription(item.description);
				return {
					id: item.id,
					name: localizedTextSchema.parse(item.name),
					description: description ? joinDescription(description) : {},
				};
			}),
		})),
	};
}

/**
 * Saves a menu book: renames it, adds, renames and reorders its sections,
 * moves its items between them, and removes what the draft left out.
 * Removed items leave their recipes in place (ADR-0019).
 */
export async function writeMenuBook(
	userId: string,
	book: MenuBookData
): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const group = await tx.menuGroup.findFirst({
			where: { id: book.id, menu: { userId } },
			include: { sections: { include: { items: true } } },
		});
		if (!group) throw new RecordNotFoundError("Menu not found.");

		const sectionIds = new Set(group.sections.map((section) => section.id));
		const items = new Map(
			group.sections.flatMap((section) => section.items).map((i) => [i.id, i])
		);
		const draftItems = book.sections.flatMap((section) => section.items);
		if (
			book.sections.some((s) => s.id && !sectionIds.has(s.id)) ||
			draftItems.some((item) => !items.has(item.id)) ||
			new Set(draftItems.map((item) => item.id)).size !== draftItems.length
		) {
			throw new RecordNotFoundError("This menu changed. Reopen it to edit.");
		}

		const catalog = await getIngredientNames(tx);
		await tx.menuGroup.update({
			where: { id: group.id },
			data: { label: book.label },
		});

		const keptSections = new Set<string>();
		for (const [s, section] of book.sections.entries()) {
			const fields = { label: section.label ?? Prisma.DbNull, position: s };
			const { id: sectionId } = section.id
				? await tx.section.update({ where: { id: section.id }, data: fields })
				: await tx.section.create({ data: { ...fields, groupId: group.id } });
			keptSections.add(sectionId);

			for (const [i, item] of section.items.entries()) {
				const previous = readDescription(items.get(item.id)!.description);
				const description = item.description
					? splitDescription(item.description, previous, catalog)
					: null;
				await tx.menuItem.update({
					where: { id: item.id },
					data: {
						sectionId,
						position: i,
						name: item.name,
						// DescriptionPart is an interface, which Prisma's Json type rejects.
						description:
							(description as Prisma.InputJsonValue | null) ?? Prisma.DbNull,
					},
				});
			}
		}

		const kept = new Set(draftItems.map((item) => item.id));
		await tx.menuItem.deleteMany({
			where: { id: { in: [...items.keys()].filter((id) => !kept.has(id)) } },
		});
		await tx.section.deleteMany({
			where: {
				id: { in: [...sectionIds].filter((id) => !keptSections.has(id)) },
			},
		});
	});
}
