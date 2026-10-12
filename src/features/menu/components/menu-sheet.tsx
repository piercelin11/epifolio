import type { MenuGroup, MenuItem } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	group: MenuGroup;
	onSelectItem: (item: MenuItem) => void;
	/** Shown in the top-right corner of the sheet. */
	chefName: string;
}

/** One menu group as a single column, laid out for the menu sheet. */
export function MenuSheet({ group, onSelectItem, chefName }: MenuSheetProps) {
	return (
		// Clips the title where it runs past the top and left edges.
		<div className="flex flex-col overflow-clip pb-24">
			<div className="flex items-start justify-between gap-6">
				{/* Trimmed to the cap height, then nudged slightly past the corner */}
				<h2 className="font-heading text-primary text-display mt-[-0.06em] ml-[-0.06em] font-bold uppercase [text-box:trim-both_cap_alphabetic]">
					{group.label}.
				</h2>
				{/* Trimmed to the cap height, so the top margin matches the right one */}
				<p className="text-body text-primary pt-(--paper-padding) pr-(--paper-padding) uppercase [text-box:trim-both_cap_alphabetic]">
					{chefName}
				</p>
			</div>
			<div className="flex flex-col gap-10 px-(--paper-padding) pt-20">
				{group.sections.map((section) => (
					<MenuSection
						key={section.id}
						section={section}
						onSelectItem={onSelectItem}
					/>
				))}
			</div>
		</div>
	);
}
