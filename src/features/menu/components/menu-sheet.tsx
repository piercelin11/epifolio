import type { MenuItem, Section } from "../types";
import { MenuSection } from "./menu-section";

interface MenuSheetProps {
	sections: Section[];
	onSelectItem: (item: MenuItem) => void;
}

/** The menu as a single column, laid out for the menu sheet of the stack. */
export function MenuSheet({ sections, onSelectItem }: MenuSheetProps) {
	return (
		<div className="flex flex-col gap-16 px-11 pt-12 pb-24">
			{sections.map((section) => (
				<MenuSection
					key={section.id}
					section={section}
					onSelectItem={onSelectItem}
				/>
			))}
		</div>
	);
}
