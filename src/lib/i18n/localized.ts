import { z } from "zod";

// Content is stored once per field with a value for each locale, e.g.
// { en: "Mushroom Velouté", zh: "蘑菇濃湯" } (ADR-0013).

/** Locales content can be written in; the first is the default. */
export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = locales[0];

/** A value written in any of the locales; each one may be missing. */
export type Localized<T> = Partial<Record<Locale, T>>;

export type LocalizedText = Localized<string>;

/** Schema for a value written in any of the locales. */
export function localizedSchema<T extends z.ZodType>(value: T) {
	return z.partialRecord(z.enum(locales), value);
}

export const localizedTextSchema = localizedSchema(z.string());

/**
 * The value for `locale`, or failing that the first locale that has one.
 * Undefined when no locale has a value.
 */
export function localize<T>(
	value: Localized<T> | null | undefined,
	locale: Locale = defaultLocale
): T | undefined {
	if (!value) return undefined;
	if (value[locale] !== undefined) return value[locale];
	const fallback = locales.find((other) => value[other] !== undefined);
	return fallback && value[fallback];
}

/**
 * Reads a stored LocalizedText field as text in `locale`; an empty string
 * when no locale has a value.
 */
export function readLocalizedText(json: unknown, locale: Locale): string {
	return localize(localizedTextSchema.parse(json), locale) ?? "";
}

/** Like readLocalizedText, but undefined for a missing or empty field. */
export function readOptionalLocalizedText(
	json: unknown,
	locale: Locale
): string | undefined {
	if (json === null || json === undefined) return undefined;
	return readLocalizedText(json, locale) || undefined;
}
