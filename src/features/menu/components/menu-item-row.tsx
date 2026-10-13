import { Fragment } from "react";

import { formatPrice } from "../lib/format";
import type { MenuItem } from "../types";

interface MenuItemRowProps {
	item: MenuItem;
	onSelect: () => void;
	/** Called with the id of an ingredient named in the description. */
	onSelectIngredient?: (ingredientId: string) => void;
}

export function MenuItemRow({
	item,
	onSelect,
	onSelectIngredient,
}: MenuItemRowProps) {
	return (
		<li className="grid grid-cols-[1fr_auto] items-baseline gap-x-10">
			<button
				type="button"
				onClick={onSelect}
				className="text-title cursor-pointer text-left uppercase hover:underline"
			>
				{item.name}
			</button>
			{/* Kept when empty, so the description still starts on its own row */}
			<span className="text-body tabular-nums">
				{item.price !== undefined && formatPrice(item.price)}
			</span>
			{item.description && (
				<p className="text-caption col-span-full font-light">
					{item.description.map((part, i) => (
						<Fragment key={i}>
							{i > 0 && " · "}
							{part.ingredientId && onSelectIngredient ? (
								<button
									type="button"
									data-ingredient-trigger
									onClick={() => onSelectIngredient(part.ingredientId!)}
									className="cursor-pointer hover:underline"
								>
									{part.text}
								</button>
							) : (
								part.text
							)}
						</Fragment>
					))}
				</p>
			)}
		</li>
	);
}
