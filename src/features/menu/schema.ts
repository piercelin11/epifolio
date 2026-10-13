import { z } from "zod";

import {
	optionalLocalizedTextSchema,
	requiredLocalizedTextSchema,
} from "@/lib/i18n/localized";

// What the menu editor sends to the server. A menu item description is
// edited as one line per locale, its phrases joined by descriptionSeparator.

export const descriptionSeparator = " · ";

export const menuItemDraftSchema = z.object({
	/** Items are created with their recipe (see dishDraftSchema), so they always exist. */
	id: z.string().min(1),
	name: requiredLocalizedTextSchema,
	description: optionalLocalizedTextSchema,
});

export const sectionDraftSchema = z.object({
	/** Absent for a section added in the editor. */
	id: z.string().min(1).optional(),
	label: optionalLocalizedTextSchema,
	items: z.array(menuItemDraftSchema),
});

/** One menu book (a menu group) as edited on the menu card. */
export const menuBookDraftSchema = z.object({
	id: z.string().min(1),
	label: requiredLocalizedTextSchema,
	sections: z.array(sectionDraftSchema),
});

/** The dish typed on the import card before its recipe is written. */
export const dishDraftSchema = z.object({
	name: requiredLocalizedTextSchema,
	description: optionalLocalizedTextSchema,
});

/** The editor's working copy; text may still be blank. */
export type MenuBookDraft = z.input<typeof menuBookDraftSchema>;
export type MenuBookData = z.output<typeof menuBookDraftSchema>;
export type DishDraft = z.input<typeof dishDraftSchema>;
export type DishData = z.output<typeof dishDraftSchema>;
