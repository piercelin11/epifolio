// Reads the quantity a cook types into an ingredient line, the inverse of
// formatQuantity() without a unit: "2", "1.5", "1/2", "1 1/2", "80-100".

export interface ParsedQuantity {
	min: number;
	/** Upper end of a range; absent for a single amount. */
	max?: number;
}

const value = String.raw`(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?|(\d+)\/(\d+)`;
const valuePattern = new RegExp(String.raw`^(?:${value})$`);

function parseValue(text: string): number | undefined {
	const match = valuePattern.exec(text.trim());
	if (!match) return undefined;
	const [, whole, top, bottom, onlyTop, onlyBottom] = match;
	if (whole !== undefined) {
		const fraction = top ? Number(top) / Number(bottom) : 0;
		return top && Number(bottom) === 0 ? undefined : Number(whole) + fraction;
	}
	return Number(onlyBottom) === 0
		? undefined
		: Number(onlyTop) / Number(onlyBottom);
}

/**
 * Null for an empty quantity (e.g. "to taste"); undefined when the text is
 * not a quantity or a range runs downwards.
 */
export function parseQuantity(text: string): ParsedQuantity | null | undefined {
	const trimmed = text.trim();
	if (!trimmed) return null;
	const ends = trimmed.split(/\s*[-–]\s*/);
	if (ends.length > 2) return undefined;
	const [min, max] = ends.map(parseValue);
	if (min === undefined || min <= 0) return undefined;
	if (ends.length === 1) return { min };
	if (max === undefined || max < min) return undefined;
	return max === min ? { min } : { min, max };
}

const inputFractions = [2, 3, 4, 8].flatMap((bottom) =>
	Array.from({ length: bottom - 1 }, (_, i) => [i + 1, bottom] as const)
);

function formatValue(value: number): string {
	const whole = Math.floor(value);
	const part = value - whole;
	if (part < 1e-6) return String(whole);
	const fraction = inputFractions.find(
		([top, bottom]) => Math.abs(part - top / bottom) < 1e-6
	);
	if (!fraction) return String(Number(value.toFixed(4)));
	const text = `${fraction[0]}/${fraction[1]}`;
	return whole > 0 ? `${whole} ${text}` : text;
}

/** A stored quantity as the cook would type it; parseQuantity() reads it back. */
export function formatQuantityInput(
	min: number | null,
	max: number | null
): string {
	if (min === null) return "";
	return max === null
		? formatValue(min)
		: `${formatValue(min)}-${formatValue(max)}`;
}
