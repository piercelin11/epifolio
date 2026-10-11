"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";

/** Switches between light and dark; the first visit follows the system. */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	function toggleTheme() {
		const next = resolvedTheme === "dark" ? "light" : "dark";
		if (!document.startViewTransition) {
			setTheme(next);
			return;
		}
		// Cross-fade the whole page; timing lives in globals.css.
		// flushSync applies the theme class before the new snapshot is taken.
		document.startViewTransition(() => flushSync(() => setTheme(next)));
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="hover:bg-backdrop-foreground/10 hover:text-backdrop-foreground dark:hover:bg-backdrop-foreground/10"
			aria-label="Toggle theme"
			onClick={toggleTheme}
		>
			<SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</Button>
	);
}
