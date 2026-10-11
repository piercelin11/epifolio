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
				className="group grid w-full max-w-2xl cursor-pointer grid-cols-[1fr_auto] gap-x-10 gap-y-1 text-left"
			>
				<span className="font-heading text-primary text-2xl uppercase group-hover:underline">
					{item.name}
				</span>
				<span className="self-center tabular-nums">
					{formatPrice(item.price)}
				</span>
				{item.description && (
					<span className="col-span-full text-sm">{item.description}</span>
				)}
			</button>
		</li>
	);
}
