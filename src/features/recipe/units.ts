import { z } from "zod";

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
] as const;

export type Unit = (typeof units)[number];

export const unitSchema = z.enum(units, {
	error: "unitInvalid" satisfies PlainErrorKey,
});

export function isUnit(value: string): value is Unit {
	return (units as readonly string[]).includes(value);
}
