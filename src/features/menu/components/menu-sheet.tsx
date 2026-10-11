import type { MenuGroup, MenuItem } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	group: MenuGroup;
	onSelectItem: (item: MenuItem) => void;
}

/** One menu group as a single column, laid out for the menu sheet. */
export function MenuSheet({ group, onSelectItem }: MenuSheetProps) {
	return (
		<div className="flex flex-col pb-24">
			{/* Trimmed to the cap height, so the title sits flush in the corner */}
			<h2 className="font-heading text-primary text-display font-bold uppercase [text-box:trim-both_cap_alphabetic]">
				{group.label}.
			</h2>
			<div className="flex flex-col gap-24 px-(--paper-padding) pt-18">
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
