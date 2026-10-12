import type { ReactNode } from "react";

import { getMenuTheme, type MenuThemeId, menuThemeStyle } from "../menu-themes";

interface MenuThemeScopeProps {
	themeId: MenuThemeId;
	className?: string;
	children: ReactNode;
}

/** Applies a menu theme to everything inside it. */
export function MenuThemeScope({
	themeId,
	className,
	children,
}: MenuThemeScopeProps) {
	return (
		<div
			data-menu-theme={themeId}
			style={menuThemeStyle(getMenuTheme(themeId))}
			className={className}
		>
			{children}
		</div>
	);
}
