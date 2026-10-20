/** Whole hours and the minutes left over, e.g. 90 is 1 h 30 min. */
export function splitMinutes(total: number): {
	hours: number;
	minutes: number;
} {
	const rounded = Math.max(0, Math.round(total));
	return { hours: Math.floor(rounded / 60), minutes: rounded % 60 };
}
