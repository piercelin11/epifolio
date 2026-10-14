/** Tuning for scaling a recipe to a number of servings. */
export const scalingConfig = {
	/** Range of servings the cook can pick. */
	servings: { min: 1, max: 20 },
	/** Fractions shown as such, e.g. "1 1/2"; other values show as decimals. */
	fractions: [
		[1, 8],
		[1, 4],
		[1, 3],
		[1, 2],
		[2, 3],
		[3, 4],
	] as const,
	/** How close a value's fractional part must be to a fraction to show it. */
	fractionTolerance: 0.03,
	/** Decimal places for values that match no fraction. */
	maxDecimals: 1,
	/** Units measured precisely enough that scaled values round to whole numbers. */
	wholeUnits: ["g", "ml"] as readonly string[],
	/** Plural spellings of units, used when the amount is more than one. */
	plurals: {
		cup: "cups",
		pinch: "pinches",
		dash: "dashes",
		clove: "cloves",
		slice: "slices",
		piece: "pieces",
	} as Readonly<Record<string, string>>,
};
