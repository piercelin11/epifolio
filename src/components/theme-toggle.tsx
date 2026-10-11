"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

/** Switches between light and dark; the first visit follows the system. */
export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<Button
			variant="outline"
			size="icon"
			aria-label="Toggle theme"
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
		>
			<SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
			<MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
		</Button>
	);
}
