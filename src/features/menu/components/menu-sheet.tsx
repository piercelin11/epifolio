import type { ReactNode } from "react";

import type { MenuGroup, MenuItem } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	group: MenuGroup;
	onSelectItem: (item: MenuItem) => void;
	/** Called with the id of an ingredient named in an item description. */
	onSelectIngredient?: (ingredientId: string) => void;
	/** Controls in the top-right corner, e.g. a theme picker. */
	actions?: ReactNode;
}

/** One menu group as a single column, laid out for the menu sheet. */
export function MenuSheet({
	group,
	onSelectItem,
	onSelectIngredient,
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
				{actions && (
					// Pulled up by the icons' inner space, so they line up with the margin.
					<div className="text-primary -mt-1 -mr-1 flex items-center gap-1 pt-(--paper-padding) pr-(--paper-padding)">
						{actions}
					</div>
				)}
			</div>
			<div className="flex flex-col gap-10 px-(--paper-padding) pt-20">
				{group.sections
					// A section left with no name and no dishes would only add a gap.
					.filter((section) => section.label || section.items.length > 0)
					.map((section) => (
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
