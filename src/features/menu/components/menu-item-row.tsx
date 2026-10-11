import { formatPrice } from "../lib/format";
import type { MenuItem } from "../types";

interface MenuItemRowProps {
	item: MenuItem;
}

export function MenuItemRow({ item }: MenuItemRowProps) {
	return (
		<li className="grid max-w-2xl grid-cols-[1fr_auto] gap-x-10 gap-y-1">
			<h3 className="font-heading text-primary text-2xl uppercase">
				{item.name}
			</h3>
			<span className="self-center tabular-nums">
				{formatPrice(item.price)}
			</span>
			{item.description && (
				<p className="col-span-full text-sm">{item.description}</p>
			)}
		</li>
	);
}
