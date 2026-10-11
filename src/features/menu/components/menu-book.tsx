import type { ReactNode } from "react";

import type { MenuSpread } from "../types";
import { MenuPage } from "./menu-page";

interface MenuBookProps {
	spread: MenuSpread;
	leftHeader: ReactNode;
	rightHeader: ReactNode;
}

/** An open menu book filling the viewport, with a fold between the pages. */
export function MenuBook({ spread, leftHeader, rightHeader }: MenuBookProps) {
	return (
		<main className="bg-background text-foreground grid h-dvh grid-cols-2">
			<MenuPage header={leftHeader} sections={spread.left} />
			<MenuPage
				header={rightHeader}
				sections={spread.right}
				className="border-border border-l"
			/>
		</main>
	);
}
