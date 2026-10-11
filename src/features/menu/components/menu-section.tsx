import type { Section } from "../types";
import { MenuItemRow } from "./menu-item-row";

interface MenuSectionProps {
	section: Section;
}

export function MenuSection({ section }: MenuSectionProps) {
	return (
		<section className="flex flex-col gap-6">
			<h2 className="font-heading text-primary text-center text-2xl tracking-[0.2em] uppercase">
				{section.label}
			</h2>
			<ul className="flex flex-col gap-5">
				{section.items.map((item) => (
					<MenuItemRow key={item.id} item={item} />
				))}
			</ul>
		</section>
	);
}
