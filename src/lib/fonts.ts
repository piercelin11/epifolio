import {
	Inter,
	Noto_Sans_TC,
	Noto_Serif_TC,
	Playfair_Display,
} from "next/font/google";

// Fonts are named by role, not by typeface (ADR-0006). To swap a typeface,
// change the import and the loader call here; components keep using
// `font-heading` / `font-sans`, mapped in src/app/globals.css.

/** Site title, group titles and section headings. */
export const headingFont = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-heading-src",
});

/** Default font for all other text. */
export const bodyFont = Inter({
	subsets: ["latin"],
	variable: "--font-body-src",
});

/*
 * Chinese text, after the Latin typefaces in each role (ADR-0030). Google
 * splits these into many small files by unicode-range, and the browser
 * fetches only the ones a page uses, so nothing is preloaded.
 */

/** Chinese in headings. */
export const headingChineseFont = Noto_Serif_TC({
	preload: false,
	variable: "--font-heading-zh-src",
});

/** Chinese in all other text. */
export const bodyChineseFont = Noto_Sans_TC({
	preload: false,
	variable: "--font-body-zh-src",
});

/** Class names that declare every font variable; apply once on `<html>`. */
export const fontVariables = [
	headingFont.variable,
	bodyFont.variable,
	headingChineseFont.variable,
	bodyChineseFont.variable,
].join(" ");
