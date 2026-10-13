import type { MenuBookDraft } from "@/features/menu/schema";

import { newKey } from "./keys";

// The menu card's working copy. Every section and item carries a client
// key, so rows keep their identity while they are added and dragged;
// the schema drops the keys when the draft is saved.

type DraftSection = MenuBookDraft["sections"][number];
type DraftItem = DraftSection["items"][number];

export type MenuItemModel = DraftItem & { key: string };
export type SectionModel = Omit<DraftSection, "items"> & {
	key: string;
	items: MenuItemModel[];
};
export type MenuModel = Omit<MenuBookDraft, "sections"> & {
	sections: SectionModel[];
};

export function toMenuModel(draft: MenuBookDraft): MenuModel {
	return {
		...draft,
		sections: draft.sections.map((section) => ({
			...section,
			key: section.id ?? newKey(),
			items: section.items.map((item) => ({ ...item, key: item.id })),
		})),
	};
}

export function findSection(model: MenuModel, key: string) {
	return model.sections.findIndex(
		(section) =>
			section.key === key || section.items.some((item) => item.key === key)
	);
}

/** Moves the item `key` into section `sectionKey` at `index`. */
export function moveItem(
	model: MenuModel,
	key: string,
	sectionKey: string,
	index: number
): MenuModel {
	const from = findSection(model, key);
	const item = model.sections[from]?.items.find((i) => i.key === key);
	if (!item) return model;
	const sections = model.sections.map((section) => ({
		...section,
		items: section.items.filter((i) => i.key !== key),
	}));
	const to = sections.findIndex((section) => section.key === sectionKey);
	if (to < 0) return model;
	const items = [...sections[to].items];
	items.splice(Math.min(index, items.length), 0, item);
	sections[to] = { ...sections[to], items };
	return { ...model, sections };
}

/**
 * Removes section `index`, keeping its items: they go to the end of the
 * section above, else the start of the one below. The only section just
 * loses its name.
 */
export function removeSection(model: MenuModel, index: number): MenuModel {
	const removed = model.sections[index];
	if (!removed) return model;
	if (model.sections.length === 1) {
		return { ...model, sections: [{ ...removed, label: {} }] };
	}
	const sections = model.sections.map((section, i) => {
		if (i === index - 1) {
			return { ...section, items: [...section.items, ...removed.items] };
		}
		if (index === 0 && i === 1) {
			return { ...section, items: [...removed.items, ...section.items] };
		}
		return section;
	});
	return { ...model, sections: sections.filter((_, i) => i !== index) };
}
