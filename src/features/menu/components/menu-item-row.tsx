import { formatPrice } from "../lib/format";
import type { MenuItem } from "../types";

interface MenuItemRowProps {
	item: MenuItem;
}

export function MenuItemRow({ item }: MenuItemRowProps) {
	return (
		<li className="flex flex-col gap-1">
			<div className="flex items-baseline justify-between gap-4">
				<h3 className="font-heading text-primary text-lg font-bold">
					{item.name}
				</h3>
				<span className="text-sm tabular-nums">{formatPrice(item.price)}</span>
			</div>
			{item.description && (
				<p className="text-muted-foreground text-sm">{item.description}</p>
			)}
		</li>
	);
}
