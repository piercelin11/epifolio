import { bareCountUnit, isUnit, unitMeasures } from "@/features/recipe/units";

import type { IngredientUnits } from "../types";

// Converting amounts between units for one ingredient (ADR-0031). Weights
// and volumes convert by the unit list's factors; counts and volume to
// weight need the ingredient's own numbers.

/** Grams in one `unit` of the ingredient; undefined when unknown. */
export function gramsPerUnit(
	unit: string,
	units: IngredientUnits
): number | undefined {
	if (!isUnit(unit)) return undefined;
	const measure = unitMeasures[unit];
	switch (measure.kind) {
		case "mass":
			return measure.grams;
		case "volume":
			return units.density === undefined
				? undefined
				: measure.ml * units.density;
		case "count":
			return units.weights[unit];
	}
}

/**
 * The unit an amount is in: its own, else the ingredient's default unit,
 * else a plain count.
 */
export function amountUnit(
	unit: string | undefined,
	units: IngredientUnits
): string {
	return unit ?? units.defaultUnit ?? bareCountUnit;
}

/**
 * `amount` of `from` expressed in `to`. The same unit, or two weights or
 * two volumes, need no ingredient data; anything else goes through grams.
 * Undefined when a number on the way is missing.
 */
export function convertAmount(
	amount: number,
	from: string,
	to: string,
	units: IngredientUnits
): number | undefined {
	if (from === to) return amount;
	if (isUnit(from) && isUnit(to)) {
		const a = unitMeasures[from];
		const b = unitMeasures[to];
		if (a.kind === "mass" && b.kind === "mass")
			return (amount * a.grams) / b.grams;
		if (a.kind === "volume" && b.kind === "volume")
			return (amount * a.ml) / b.ml;
	}
	const fromGrams = gramsPerUnit(from, units);
	const toGrams = gramsPerUnit(to, units);
	if (fromGrams === undefined || !toGrams) return undefined;
	return (amount * fromGrams) / toGrams;
}
