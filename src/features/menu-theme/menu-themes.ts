import type { CSSProperties } from "react";

/** Colours that make up one menu theme; every other token derives from these. */
export interface MenuThemeColors {
	/** Menu sheet paper. */
	background: string;
	/** Menu sheet text. */
	foreground: string;
	/** Titles and the recipe sheet paper. */
	primary: string;
	/** Recipe sheet text. */
	primaryForeground: string;
}

/** Opacity of the texture laid over each sheet; dark paper needs less. */
export interface MenuThemeTexture {
	paper: number;
	primary: number;
}

export interface MenuTheme {
	id: string;
	label: string;
	colors: MenuThemeColors;
	texture: MenuThemeTexture;
}

const lightTexture: MenuThemeTexture = { paper: 1, primary: 0.6 };
const darkTexture: MenuThemeTexture = { paper: 0.35, primary: 0.2 };

/**
 * The menu themes a book can use. The first one is also the site default,
 * applied to the whole page for the header, dialogs and toasts.
 */
export const menuThemes = [
	{
		id: "classic",
		label: "Classic",
		colors: {
			background: "#eae0d0",
			foreground: "#000000",
			primary: "#9c2e20",
			primaryForeground: "#f2e8d8",
		},
		texture: lightTexture,
	},
	{
		id: "olive",
		label: "Olive",
		colors: {
			background: "#363b20",
			foreground: "#ced2be",
			primary: "#cab274",
			primaryForeground: "#363b20",
		},
		texture: darkTexture,
	},
	{
		id: "navy",
		label: "Navy",
		colors: {
			background: "#202c3c",
			foreground: "#929291",
			primary: "#9b5b39",
			primaryForeground: "#202c3c",
		},
		texture: darkTexture,
	},
	{
		id: "cocoa",
		label: "Cocoa",
		colors: {
			background: "#4b3326",
			foreground: "#c3b0a4",
			primary: "#a7a87f",
			primaryForeground: "#4b3326",
		},
		texture: darkTexture,
	},
	{
		id: "sand",
		label: "Sand",
		colors: {
			background: "#bcb39d",
			foreground: "#3a3b2d",
			primary: "#414c5e",
			primaryForeground: "#bcb39d",
		},
		texture: lightTexture,
	},
	{
		id: "espresso",
		label: "Espresso",
		colors: {
			background: "#2e2a24",
			foreground: "#a49c92",
			primary: "#c1ae88",
			primaryForeground: "#2e2a24",
		},
		texture: darkTexture,
	},
	{
		id: "fern",
		label: "Fern",
		colors: {
			background: "#dfc5a9",
			foreground: "#594c4a",
			primary: "#3b5131",
			primaryForeground: "#dfc5a9",
		},
		texture: lightTexture,
	},
	{
		id: "lavender",
		label: "Lavender",
		colors: {
			background: "#e1ccd0",
			foreground: "#655455",
			primary: "#56508c",
			primaryForeground: "#e1ccd0",
		},
		texture: lightTexture,
	},
] as const satisfies readonly MenuTheme[];

export type MenuThemeId = (typeof menuThemes)[number]["id"];

export const defaultMenuTheme: MenuTheme = menuThemes[0];

export function getMenuTheme(id: MenuThemeId): MenuTheme {
	return menuThemes.find((theme) => theme.id === id) ?? defaultMenuTheme;
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
		"--paper-texture-paper-opacity": texture.paper,
		"--paper-texture-primary-opacity": texture.primary,
	} as CSSProperties;
}
