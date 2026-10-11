import { IBM_Plex_Sans, Playfair_Display } from "next/font/google";

// Fonts are named by role, not by typeface (ADR-0006). To swap a typeface,
// change the import and the loader call here; components keep using
// `font-heading` / `font-sans`, mapped in src/app/globals.css.

/** Site title, group titles and section headings. */
export const headingFont = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-heading-src",
});

/** Default font for all other text. */
export const bodyFont = IBM_Plex_Sans({
	subsets: ["latin"],
	variable: "--font-body-src",
});

/** Class names that declare every font variable; apply once on `<html>`. */
export const fontVariables = [headingFont.variable, bodyFont.variable].join(
	" "
);
