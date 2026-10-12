import type { CSSProperties, ReactNode, Ref } from "react";

import { getMenuTheme, type MenuThemeId, menuThemeStyle } from "../menu-themes";

interface MenuThemeScopeProps {
	themeId: MenuThemeId;
	className?: string;
	/** Extra inline styles, merged under the theme's variables. */
	style?: CSSProperties;
	ref?: Ref<HTMLDivElement>;
	inert?: boolean;
	children: ReactNode;
}

/** Applies a menu theme to everything inside it. */
export function MenuThemeScope({
	themeId,
	className,
	style,
	ref,
	inert,
	children,
}: MenuThemeScopeProps) {
	return (
		<div
			ref={ref}
			inert={inert}
			data-menu-theme={themeId}
			style={{ ...style, ...menuThemeStyle(getMenuTheme(themeId)) }}
			className={className}
		>
			{children}
		</div>
	);
}
