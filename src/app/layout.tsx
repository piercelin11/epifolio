import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import {
	defaultMenuTheme,
	menuThemeStyle,
} from "@/features/menu-theme/menu-themes";
import { fontVariables } from "@/lib/fonts";
import { htmlLangScript } from "@/lib/i18n/locale-cookie";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
	title: "Epifolio",
	description: "A personal menu and recipe book",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={cn(fontVariables, "h-full antialiased")}
			data-menu-theme={defaultMenuTheme.id}
			style={menuThemeStyle(defaultMenuTheme)}
			// The inline script below may change lang before React hydrates.
			suppressHydrationWarning
		>
			<head>
				{/* Sets lang from the locale cookie; the layout stays static (ADR-0028) */}
				<script dangerouslySetInnerHTML={{ __html: htmlLangScript }} />
			</head>
			<body className="flex min-h-full flex-col">
				{children}
				<Toaster />
			</body>
		</html>
	);
}
