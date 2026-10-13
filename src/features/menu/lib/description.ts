import {
	type IngredientNames,
	matchIngredient,
} from "@/features/ingredient/lib/match-ingredient";
import {
	type Localized,
	type LocalizedText,
	mapLocalized,
} from "@/lib/i18n/localized";

import { descriptionSeparator } from "../schema";
import type { DescriptionPart } from "../types";

export type DescriptionParts = Localized<DescriptionPart[]>;

/** A description as the editor shows it: one line per locale. */
export function joinDescription(parts: DescriptionParts): LocalizedText {
	return mapLocalized(parts, (list) =>
		list.map((part) => part.text).join(descriptionSeparator)
	);
}

/**
 * Splits edited description lines into phrases. A locale whose line did not
 * change keeps its parts; a phrase that already named an ingredient keeps
 * it; any other phrase is matched against the catalog.
 */
export function splitDescription(
	text: LocalizedText,
	previous: DescriptionParts | null,
	catalog: IngredientNames[]
): DescriptionParts {
	const known = new Map<string, string>();
	for (const list of Object.values(previous ?? {})) {
		for (const part of list ?? []) {
			if (part.ingredientId) known.set(part.text, part.ingredientId);
		}
	}
	const before = previous ? joinDescription(previous) : {};
	return mapLocalized(text, (line, locale) => {
		const old = previous?.[locale];
		if (old && before[locale] === line) return old;
		return line
			.split(descriptionSeparator.trim())
			.map((phrase) => phrase.trim())
			.filter(Boolean)
			.map((phrase) => {
				const ingredientId =
					known.get(phrase) ?? matchIngredient(phrase, catalog);
				return ingredientId ? { text: phrase, ingredientId } : { text: phrase };
			});
	});
}
