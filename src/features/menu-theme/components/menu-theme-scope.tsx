import type { CSSProperties, ReactNode } from "react";

import { getMenuTheme, type MenuThemeId, menuThemeStyle } from "../menu-themes";

interface MenuThemeScopeProps {
	themeId: MenuThemeId;
	className?: string;
	/** Extra inline styles, merged under the theme's variables. */
	style?: CSSProperties;
	children: ReactNode;
}

/** Applies a menu theme to everything inside it. */
export function MenuThemeScope({
	themeId,
	className,
	style,
	children,
}: MenuThemeScopeProps) {
	return (
		<div
			data-menu-theme={themeId}
			style={{ ...style, ...menuThemeStyle(getMenuTheme(themeId)) }}
			className={className}
		>
			{children}
		</div>
	);
}
