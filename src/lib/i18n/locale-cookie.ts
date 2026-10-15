import { defaultLocale, type Locale, locales } from "./localized";

// The interface language is kept in a cookie (ADR-0028). This file has no
// server-only imports: the inline script in the root layout uses it too.

export const localeCookie = "locale";

/** The `lang` attribute for each locale. */
export const htmlLang: Record<Locale, string> = { en: "en", zh: "zh-Hant" };

/** The locale a cookie value names; the default for a missing or bad one. */
export function parseLocale(value: string | undefined): Locale {
	return locales.find((locale) => locale === value) ?? defaultLocale;
}

/**
 * Sets `<html lang>` from the cookie before the first paint, so the root
 * layout can stay static.
 */
export const htmlLangScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${localeCookie}=([^;]*)/);var l=${JSON.stringify(htmlLang)}[m&&m[1]];if(l)document.documentElement.lang=l}catch(e){}})()`;
