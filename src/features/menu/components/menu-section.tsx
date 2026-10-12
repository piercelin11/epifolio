import type { MenuItem, Section } from "../types";
import { MenuItemRow } from "./menu-item-row";

interface MenuSectionProps {
	section: Section;
	onSelectItem: (item: MenuItem) => void;
	onSelectIngredient?: (ingredientId: string) => void;
}

export function MenuSection({
	section,
	onSelectItem,
	onSelectIngredient,
}: MenuSectionProps) {
	return (
		<section className="flex flex-col gap-4">
			{section.label && (
				<h3 className="font-heading text-primary text-heading font-bold uppercase">
					{section.label}.
				</h3>
			)}
			<ul className="flex flex-col gap-4">
				{section.items.map((item) => (
					<MenuItemRow
						key={item.id}
						item={item}
						onSelect={() => onSelectItem(item)}
						onSelectIngredient={onSelectIngredient}
					/>
				))}
			</ul>
		</section>
	);
}
