import type { ReactNode } from "react";

import type { MenuGroup, MenuItem } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	group: MenuGroup;
	onSelectItem: (item: MenuItem) => void;
	/** Called with the id of an ingredient named in an item description. */
	onSelectIngredient?: (ingredientId: string) => void;
	/** Shown in the top-right corner of the sheet. */
	chefName: string;
	/** Controls placed just left of the chef name, e.g. a theme picker. */
	actions?: ReactNode;
}

/** One menu group as a single column, laid out for the menu sheet. */
export function MenuSheet({
	group,
	onSelectItem,
	onSelectIngredient,
	chefName,
	actions,
}: MenuSheetProps) {
	return (
		// Clips the title where it runs past the top and left edges.
		<div className="flex flex-col overflow-clip pb-24">
			<div className="flex items-start justify-between gap-6">
				{/* Trimmed to the cap height, then nudged slightly past the corner */}
				<h2 className="font-heading text-primary text-display mt-[-0.06em] ml-[-0.06em] font-bold uppercase [text-box:trim-both_cap_alphabetic]">
					{group.label}.
				</h2>
				<div className="relative pt-(--paper-padding) pr-(--paper-padding)">
					{/* Out of the flow, so the chef name stays where it is */}
					{actions && (
						<div className="absolute top-(--paper-padding) right-full mr-2 flex -translate-y-1/4 items-center gap-1">
							{actions}
						</div>
					)}
					{/* Trimmed to the cap height, so the top margin matches the right one */}
					<p className="text-body text-primary uppercase [text-box:trim-both_cap_alphabetic]">
						{chefName}
					</p>
				</div>
			</div>
			<div className="flex flex-col gap-10 px-(--paper-padding) pt-20">
				{group.sections.map((section) => (
					<MenuSection
						key={section.id}
						section={section}
						onSelectItem={onSelectItem}
						onSelectIngredient={onSelectIngredient}
					/>
				))}
			</div>
		</div>
	);
}
