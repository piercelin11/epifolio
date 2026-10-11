import type { MenuGroup, MenuItem } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	group: MenuGroup;
	onSelectItem: (item: MenuItem) => void;
}

/** One menu group as a single column, laid out for the menu sheet. */
export function MenuSheet({ group, onSelectItem }: MenuSheetProps) {
	return (
		<div className="flex flex-col gap-10 px-11 pt-10 pb-24">
			<h2 className="font-heading text-primary text-display font-bold lowercase">
				{group.label}
			</h2>
			<div className="flex flex-col gap-20">
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
