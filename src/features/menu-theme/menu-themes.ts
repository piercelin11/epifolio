import type { CSSProperties } from "react";

import type { Locale } from "@/lib/i18n/localized";

/** Colours that make up one menu theme; every other token derives from these. */
export interface MenuThemeColors {
	/** Menu sheet paper. */
	background: string;
	/** Menu sheet text. */
	foreground: string;
	/** Titles and the recipe folder. */
	primary: string;
	/** Recipe folder text. */
	primaryForeground: string;
	/**
	 * The folder's back flap. Derived from `primary` in globals.css when
	 * absent (ADR-0035); set it where the derived colour looks wrong.
	 */
	primaryDeep?: string;
}

/** Opacity of the texture laid over each sheet; dark paper needs less. */
export interface MenuThemeTexture {
	/** The menu sheet. */
	paper: number;
	/** The recipe folder. */
	primary: number;
}

export interface MenuTheme {
	id: string;
	/** The theme's name in each locale. */
	label: Record<Locale, string>;
	colors: MenuThemeColors;
	texture: MenuThemeTexture;
}

/*
 * Texture presets by how light a theme's menu paper is. The overlay blend
 * shows more on some colours than others, so a theme can override either
 * value: `texture: { ...lightPaperTexture, paper: 0.5 }`.
 */
const lightPaperTexture: MenuThemeTexture = { paper: 0.35, primary: 0.35 };
const darkPaperTexture: MenuThemeTexture = { paper: 0.4, primary: 0.4 };

/**
 * The menu themes a book can use. The first one is also the site default,
 * applied to the whole page for the header, dialogs and toasts.
 */
export const menuThemes = [
	{
		id: "classic",
		label: { en: "Classic", zh: "經典" },
		colors: {
			background: "#eae0d0",
			foreground: "#000000",
			primary: "#9c2e20",
			primaryForeground: "#f2e8d8",
		},
		texture: lightPaperTexture,
	},
	{
		id: "olive",
		label: { en: "Olive", zh: "橄欖" },
		colors: {
			background: "#363b20",
			foreground: "#ced2be",
			primary: "#cab274",
			primaryForeground: "#363b20",
		},
		texture: darkPaperTexture,
	},
	{
		id: "navy",
		label: { en: "Navy", zh: "海軍藍" },
		colors: {
			background: "#202c3c",
			foreground: "#929291",
			primary: "#9b5b39",
			primaryForeground: "#202c3c",
		},
		texture: darkPaperTexture,
	},
	{
		id: "cocoa",
		label: { en: "Cocoa", zh: "可可" },
		colors: {
			background: "#4b3326",
			foreground: "#c3b0a4",
			primary: "#a7a87f",
			primaryForeground: "#4b3326",
		},
		texture: darkPaperTexture,
	},
	{
		id: "sand",
		label: { en: "Sand", zh: "沙色" },
		colors: {
			background: "#bcb39d",
			foreground: "#3a3b2d",
			primary: "#414c5e",
			primaryForeground: "#bcb39d",
		},
		texture: lightPaperTexture,
	},
	{
		id: "espresso",
		label: { en: "Espresso", zh: "濃縮咖啡" },
		colors: {
			background: "#2e2a24",
			foreground: "#a49c92",
			primary: "#c1ae88",
			primaryForeground: "#2e2a24",
		},
		texture: darkPaperTexture,
	},
	{
		id: "fern",
		label: { en: "Fern", zh: "蕨綠" },
		colors: {
			background: "#dfc5a9",
			foreground: "#594c4a",
			primary: "#3b5131",
			primaryForeground: "#dfc5a9",
		},
		texture: lightPaperTexture,
	},
	{
		id: "lavender",
		label: { en: "Lavender", zh: "薰衣草" },
		colors: {
			background: "#e1ccd0",
			foreground: "#655455",
			primary: "#56508c",
			primaryForeground: "#e1ccd0",
		},
		texture: lightPaperTexture,
	},
] as const satisfies readonly MenuTheme[];

export type MenuThemeId = (typeof menuThemes)[number]["id"];

export const defaultMenuTheme: MenuTheme = menuThemes[0];

export function getMenuTheme(id: MenuThemeId): MenuTheme {
	return menuThemes.find((theme) => theme.id === id) ?? defaultMenuTheme;
}

export function isMenuThemeId(id: string): id is MenuThemeId {
	return menuThemes.some((theme) => theme.id === id);
}

/**
 * A stored theme id, or the default theme's when the id is no longer in
 * the list (ADR-0016).
 */
export function resolveMenuThemeId(id: string): MenuThemeId {
	return isMenuThemeId(id) ? id : menuThemes[0].id;
}

/**
 * The theme as CSS custom properties. Set them on an element marked with
 * `data-menu-theme`; globals.css derives the remaining tokens there.
 */
export function menuThemeStyle(theme: MenuTheme): CSSProperties {
	const { colors, texture } = theme;
	return {
		"--background": colors.background,
		"--foreground": colors.foreground,
		"--primary": colors.primary,
		"--primary-foreground": colors.primaryForeground,
		...(colors.primaryDeep && { "--primary-deep": colors.primaryDeep }),
		"--paper-texture-paper-opacity": texture.paper,
		"--paper-texture-primary-opacity": texture.primary,
	} as CSSProperties;
}
