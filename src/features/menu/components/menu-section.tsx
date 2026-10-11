import type { Section } from "../types";
import { MenuItemRow } from "./menu-item-row";

interface MenuSectionProps {
	section: Section;
}

export function MenuSection({ section }: MenuSectionProps) {
	return (
		<section className="flex flex-col gap-10">
			<h2 className="font-heading text-primary text-6xl font-bold lowercase">
				{section.label}
			</h2>
			<ul className="flex flex-col gap-6">
				{section.items.map((item) => (
					<MenuItemRow key={item.id} item={item} />
				))}
			</ul>
		</section>
	);
}
