import { formatPrice } from "../lib/format";
import type { MenuItem } from "../types";

interface MenuItemRowProps {
	item: MenuItem;
	onSelect: () => void;
}

export function MenuItemRow({ item, onSelect }: MenuItemRowProps) {
	return (
		<li>
			<button
				type="button"
				onClick={onSelect}
				className="group grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-10 gap-y-1 text-left"
			>
				<span className="font-heading text-title uppercase group-hover:underline">
					{item.name}
				</span>
				<span className="text-body tabular-nums">
					{formatPrice(item.price)}
				</span>
				{item.description && (
					<span className="text-body col-span-full">{item.description}</span>
				)}
			</button>
		</li>
	);
}
