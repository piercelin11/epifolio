import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
	title: "Epifolio",
	description: "A personal menu and recipe book",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={cn(fontVariables, "h-full antialiased")}>
			<body className="flex min-h-full flex-col">
				{children}
				<Toaster />
			</body>
		</html>
	);
}
