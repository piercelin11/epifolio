/** Formats a menu price as a plain number, e.g. 1280 -> "1,280". */
export function formatPrice(price: number): string {
	return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
		price
	);
}
