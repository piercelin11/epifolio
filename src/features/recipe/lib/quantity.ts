import { scalingConfig } from "../scaling";
import type { Quantity } from "../types";

/** Keeps a number of servings within the configured range. */
export function clampServings(servings: number): number {
	const { min, max } = scalingConfig.servings;
	return Math.min(Math.max(servings, min), max);
}

/** Multiplies a quantity, or both ends of a range, by `factor`. */
export function scaleQuantity(quantity: Quantity, factor: number): Quantity {
	return typeof quantity === "number"
		? quantity * factor
		: [quantity[0] * factor, quantity[1] * factor];
}

/** Formats one value as a whole number, a mixed fraction or a decimal. */
function formatValue(value: number, unit?: string): string {
	const { fractions, fractionTolerance, maxDecimals, wholeUnits } =
		scalingConfig;
	if (unit && wholeUnits.includes(unit) && value >= 1) {
		return String(Math.round(value));
	}
	const whole = Math.floor(value);
	const part = value - whole;
	if (part < fractionTolerance && whole > 0) return String(whole);
	if (part > 1 - fractionTolerance) return String(whole + 1);
	const fraction = fractions.find(
		([top, bottom]) => Math.abs(part - top / bottom) < fractionTolerance
	);
	if (fraction) {
		const text = `${fraction[0]}/${fraction[1]}`;
		return whole > 0 ? `${whole} ${text}` : text;
	}
	return String(Number(value.toFixed(maxDecimals)));
}

/**
 * Formats a quantity with its unit, e.g. "1 1/2 tbsp", "80–100 g",
 * "2 cloves". A range whose ends format the same shows one value.
 */
export function formatQuantity(quantity: Quantity, unit?: string): string {
	const [low, high] =
		typeof quantity === "number" ? [quantity, quantity] : quantity;
	const lowText = formatValue(low, unit);
	const highText = formatValue(high, unit);
	const amount = lowText === highText ? lowText : `${lowText}–${highText}`;
	if (!unit) return amount;
	const plural = high > 1 ? scalingConfig.plurals[unit] : undefined;
	return `${amount} ${plural ?? unit}`;
}
