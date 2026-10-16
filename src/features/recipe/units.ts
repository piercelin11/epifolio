import { z } from "zod";

import type { Locale } from "@/lib/i18n/localized";
import type { PlainErrorKey } from "@/lib/i18n/messages";

/**
 * Units an ingredient line can be measured in. The database stores the id;
 * this list is the only source of valid values (ADR-0016).
 */
export const units = [
	"g",
	"kg",
	"ml",
	"L",
	"oz",
	"lb",
	"tsp",
	"tbsp",
	"cup",
	"pinch",
	"dash",
	"clove",
	"slice",
	"piece",
	"head",
	"bunch",
	"stalk",
] as const;

export type Unit = (typeof units)[number];

export const unitSchema = z.enum(units, {
	error: "unitInvalid" satisfies PlainErrorKey,
});

export function isUnit(value: string): value is Unit {
	return (units as readonly string[]).includes(value);
}

/**
 * What a unit measures (ADR-0031): a weight in grams, a volume in
 * millilitres, or a count whose weight depends on the ingredient (a clove
 * of garlic, a head of lettuce). Pinch and dash count as small volumes.
 */
export type UnitMeasure =
	| { kind: "mass"; grams: number }
	| { kind: "volume"; ml: number }
	| { kind: "count" };

export const unitMeasures: Record<Unit, UnitMeasure> = {
	g: { kind: "mass", grams: 1 },
	kg: { kind: "mass", grams: 1000 },
	oz: { kind: "mass", grams: 28.35 },
	lb: { kind: "mass", grams: 453.6 },
	ml: { kind: "volume", ml: 1 },
	L: { kind: "volume", ml: 1000 },
	tsp: { kind: "volume", ml: 5 },
	tbsp: { kind: "volume", ml: 15 },
	cup: { kind: "volume", ml: 240 },
	pinch: { kind: "volume", ml: 0.3 },
	dash: { kind: "volume", ml: 0.6 },
	clove: { kind: "count" },
	slice: { kind: "count" },
	piece: { kind: "count" },
	head: { kind: "count" },
	bunch: { kind: "count" },
	stalk: { kind: "count" },
};

/**
 * The unit a bare count ("1 onion") is read in when the ingredient names no
 * default unit.
 */
export const bareCountUnit: Unit = "piece";

/** Units whose weight each ingredient records, e.g. grams per clove. */
export const countUnits = units.filter(
	(unit) => unitMeasures[unit].kind === "count"
);

/** How a unit is written; `other` is the form for more than one, if different. */
interface UnitLabel {
	one: string;
	other?: string;
}

/** Each unit as written in each locale (ADR-0013, ADR-0016). */
export const unitLabels: Record<Locale, Record<Unit, UnitLabel>> = {
	en: {
		g: { one: "g" },
		kg: { one: "kg" },
		ml: { one: "ml" },
		L: { one: "L" },
		oz: { one: "oz" },
		lb: { one: "lb" },
		tsp: { one: "tsp" },
		tbsp: { one: "tbsp" },
		cup: { one: "cup", other: "cups" },
		pinch: { one: "pinch", other: "pinches" },
		dash: { one: "dash", other: "dashes" },
		clove: { one: "clove", other: "cloves" },
		slice: { one: "slice", other: "slices" },
		piece: { one: "piece", other: "pieces" },
		head: { one: "head", other: "heads" },
		bunch: { one: "bunch", other: "bunches" },
		stalk: { one: "stalk", other: "stalks" },
	},
	zh: {
		g: { one: "g" },
		kg: { one: "kg" },
		ml: { one: "ml" },
		L: { one: "L" },
		oz: { one: "盎司" },
		lb: { one: "磅" },
		tsp: { one: "茶匙" },
		tbsp: { one: "大匙" },
		cup: { one: "杯" },
		pinch: { one: "小撮" },
		dash: { one: "少許" },
		clove: { one: "瓣" },
		slice: { one: "片" },
		piece: { one: "個" },
		head: { one: "球" },
		bunch: { one: "把" },
		stalk: { one: "根" },
	},
};

/**
 * A unit as written in `locale`, plural when `amount` is more than one.
 * A unit not in the list is shown as stored.
 */
export function unitLabel(unit: string, locale: Locale, amount = 1): string {
	if (!isUnit(unit)) return unit;
	const label = unitLabels[locale][unit];
	return amount > 1 ? (label.other ?? label.one) : label.one;
}
